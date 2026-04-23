import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp, where, getDocs, orderBy, limit, runTransaction, getDoc } from 'firebase/firestore';
import { AdminStaff, Reservation, Patient, ClinicSettings, DayOfWeek, UserProfile } from '../../types';
import { Timeline } from './Timeline';
import { format, startOfDay, endOfDay, addMinutes, parse } from 'date-fns';
import { Plus, X, Calendar as CalendarIcon, Clock, User, FileText, CheckCircle2, AlertCircle, Search, UserPlus, Bell } from 'lucide-react';
import { safeAddDoc, safeUpdateDoc, validateClinicId, createAuditLog } from '../../lib/safeFirestore';
import { getJapaneseHolidayName } from '../../src/lib/holidayUtils';
import { generateAccessToken } from '../../lib/randomUtils';
import { perf } from '@/ledger/utils/performance';

export const validateReservationTime = (
  date: string, // YYYY-MM-DD
  startTime: string, // HH:mm
  endTime: string, // HH:mm
  settings: ClinicSettings | null,
  isNew: boolean = true
): { isValid: boolean; error?: string } => {
  if (!settings) return { isValid: true };

  // 1. 手動設定の休診日チェック
  if (settings.holidays && settings.holidays.includes(date)) {
    return { isValid: false, error: '休診日です' };
  }

  // 2. 日本の祝日チェック (設定がONの場合)
  if (settings.closeOnNationalHolidays && isNew) {
    const holidayName = getJapaneseHolidayName(date);
    if (holidayName) {
      return { isValid: false, error: `この日は祝日（${holidayName}）のため休診日です。予約できません。` };
    }
  }

  const dateObj = new Date(date);
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = days[dateObj.getDay()];
  
  const dailyHours = settings.businessHours?.[dayOfWeek];
  if (dailyHours && !dailyHours.isOpen) {
    return { isValid: false, error: '休診日です' };
  }

  if (dailyHours) {
    if (startTime < dailyHours.start || endTime > dailyHours.end) {
      return { isValid: false, error: 'この予約は営業時間内に収まりません' };
    }
  }

  return { isValid: true };
};

export const checkStaffAvailability = (
  date: string, // YYYY-MM-DD
  startTime: string, // HH:mm
  endTime: string, // HH:mm
  staff: AdminStaff | undefined
): { isValid: boolean; error?: string } => {
  if (!staff || !staff.schedule) return { isValid: true };

  const dateObj = new Date(date);
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = days[dateObj.getDay()];
  
  const dailySchedule = staff.schedule[dayOfWeek];
  if (dailySchedule && !dailySchedule.isWorking) {
    return { isValid: false, error: `${staff.name}は休診日です` };
  }

  if (dailySchedule) {
    if (startTime < dailySchedule.start || endTime > dailySchedule.end) {
      return { isValid: false, error: 'このスタッフの勤務終了時刻を超えています' };
    }

    if (dailySchedule.breakStart && dailySchedule.breakEnd) {
      if (startTime < dailySchedule.breakEnd && endTime > dailySchedule.breakStart) {
        return { isValid: false, error: 'この予約は休憩時間にかかっています' };
      }
    }
  }

  return { isValid: true };
};

export const AdminDashboard: React.FC<{ clinicId?: string }> = ({ clinicId: propClinicId }) => {
  const context = useOutletContext<{ clinicId: string, userProfile: UserProfile }>();
  const params = useParams<{ clinicId: string }>();
  const clinicId = propClinicId || context?.clinicId || params.clinicId;
  const userProfile = context?.userProfile;
  const [staffList, setStaffList] = useState<AdminStaff[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [modalData, setModalData] = useState<Partial<Reservation>>({});
  const [searchPatientId, setSearchPatientId] = useState('');
  const [patientNotFound, setPatientNotFound] = useState(false);
  const [topSearchPatientId, setTopSearchPatientId] = useState('');
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Notifications
  const todayStart = startOfDay(new Date());
  const notifications = reservations.filter(r => {
    if (!r.updatedAt) return false;
    const updatedDate = r.updatedAt instanceof Timestamp ? r.updatedAt.toDate() : new Date(r.updatedAt);
    return updatedDate >= todayStart;
  }).sort((a, b) => {
    const dateA = a.updatedAt instanceof Timestamp ? a.updatedAt.toDate() : new Date(a.updatedAt || 0);
    const dateB = b.updatedAt instanceof Timestamp ? b.updatedAt.toDate() : new Date(b.updatedAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  useEffect(() => {
    if (notifications.length > 0) {
      setHasUnread(true);
    }
  }, [notifications.length]);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasUnread(false);
    }
  };

  useEffect(() => {
    if (!clinicId) return;
    perf.start('AdminDashboard_init');

    // Fetch Settings
    const fetchSettings = async () => {
      try {
        perf.start('AdminDashboard_settings_fetch');
        const docRef = doc(db, `clinics/${clinicId}/settings/business`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as ClinicSettings);
        }
        perf.end('AdminDashboard_settings_fetch');
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `clinics/${clinicId}/settings/business`);
      }
    };
    fetchSettings();

    // Fetch Staff
    perf.start('AdminDashboard_staff_fetch');
    const staffRef = collection(db, `clinics/${clinicId}/staff`);
    const unsubStaff = onSnapshot(staffRef, (snapshot) => {
      perf.mark('AdminDashboard_staff_received');
      const staffData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminStaff));
      setStaffList(staffData);
      perf.end('AdminDashboard_staff_fetch');
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/staff`);
      perf.end('AdminDashboard_staff_fetch');
    });

    // Fetch Reservations for Selected Date
    perf.start('AdminDashboard_res_fetch');
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const resRef = collection(db, `clinics/${clinicId}/reservations`);
    const q = query(resRef, where('date', '==', dateStr));
    const unsubRes = onSnapshot(q, (snapshot) => {
      perf.mark('AdminDashboard_res_received');
      const resData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
      setReservations(resData);
      perf.end('AdminDashboard_res_fetch');
      perf.end('AdminDashboard_init');
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinicId}/reservations`);
      perf.end('AdminDashboard_res_fetch');
      perf.end('AdminDashboard_init');
    });

    return () => {
      unsubStaff();
      unsubRes();
    };
  }, [clinicId, selectedDate]);

  // Auto-reload every 30 minutes
  const [autoReload, setAutoReload] = useState(true);
  useEffect(() => {
    if (!autoReload) return;
    const interval = setInterval(() => {
      window.location.reload();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoReload]);

  const handleAddReservation = (staffId: string, time: string) => {
    setEditingReservation(null);
    setSearchPatientId('');
    setPatientNotFound(false);
    setModalData({
      staffId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: time,
      endTime: format(new Date(2000, 0, 1, parseInt(time.split(':')[0]), parseInt(time.split(':')[1]) + 30), 'HH:mm'),
      status: 'provisional',
      visitStatus: 'not_arrived',
      selfMenus: [],
      selfTotal: 0,
      grandTotal: 0,
      paymentMethod: 'cash',
      category: 'jusei'
    });
    setIsModalOpen(true);
  };

  const handleReservationClick = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setSearchPatientId(reservation.patientId ? reservation.patientId.toString() : '');
    setPatientNotFound(false);
    setModalData(reservation);
    setIsModalOpen(true);
  };

  const handleReservationMove = async (reservationId: string, newStaffId: string, newStartTime: string) => {
    if (!clinicId) return;
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      const start = new Date(`2000-01-01T${reservation.startTime}:00`);
      const end = new Date(`2000-01-01T${reservation.endTime}:00`);
      const durationMins = (end.getTime() - start.getTime()) / 60000;

      const newStart = new Date(`2000-01-01T${newStartTime}:00`);
      const newEnd = new Date(newStart.getTime() + durationMins * 60000);
      const newEndTime = format(newEnd, 'HH:mm');

      const timeValidation = validateReservationTime(reservation.date, newStartTime, newEndTime, settings, false);
      if (!timeValidation.isValid) {
        alert(timeValidation.error);
        return;
      }

      const targetStaff = staffList.find(s => s.id === newStaffId);
      const staffValidation = checkStaffAvailability(reservation.date, newStartTime, newEndTime, targetStaff);
      if (!staffValidation.isValid) {
        alert(staffValidation.error);
        return;
      }

      // Double booking check
      if (!isTimeSlotAvailable(newStaffId, newStartTime, newEndTime, reservationId)) {
        alert('選択された時間は既に予約が埋まっています。別の時間を選択してください。');
        return;
      }

      await safeUpdateDoc(
        clinicId,
        `clinics/${clinicId}/reservations`,
        reservationId,
        {
          staffId: newStaffId,
          startTime: newStartTime,
          endTime: newEndTime,
          updatedAt: Timestamp.now()
        },
        'reservation_update',
        `${reservation.patientName}様の予約を移動しました (${newStartTime}〜)`,
        'canManageReservations'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}/reservations/${reservationId}`);
    }
  };

  const toggleHolidayClosing = async () => {
    if (!clinicId) return;
    const newValue = !(settings?.closeOnNationalHolidays);
    try {
      await setDoc(doc(db, `clinics/${clinicId}/settings/business`), {
        closeOnNationalHolidays: newValue
      }, { merge: true });
      setSettings(prev => ({ ...(prev || {} as ClinicSettings), closeOnNationalHolidays: newValue }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}/settings/business`);
    }
  };

  const handleSearchPatient = async (idStr: string, isTopSearch: boolean = false) => {
    if (!clinicId) return;
    
    if (!idStr) {
      if (!isTopSearch) {
        setPatientNotFound(true);
        setModalData(prev => ({ ...prev, patientId: undefined, patientName: '' }));
      }
      return;
    }

    const idNum = parseInt(idStr);
    if (isNaN(idNum) || idNum < 1 || idNum > 100000) {
      if (!isTopSearch) setPatientNotFound(true);
      return;
    }

    try {
      const q = query(collection(db, `clinics/${clinicId}/patients`), where('patientId', '==', idNum));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const patient = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Patient;
        
        // 前回所要時間を取得
        let lastDuration = 30;
        try {
          const resQ = query(
            collection(db, `clinics/${clinicId}/reservations`),
            where('patientId', '==', patient.patientId),
            limit(10) // 最新のものをクライアント側で探すため少し多めに取得
          );
          const resSnap = await getDocs(resQ);
          if (!resSnap.empty) {
            // dateとstartTimeでソートして最新を取得
            const sortedRes = resSnap.docs
              .map(doc => doc.data() as Reservation)
              .sort((a, b) => {
                const strA = `${a.date || ''}T${a.startTime || ''}`;
                const strB = `${b.date || ''}T${b.startTime || ''}`;
                return strB.localeCompare(strA);
              });
            
            const lastRes = sortedRes[0];
            if (lastRes && lastRes.startTime && lastRes.endTime) {
              const start = parse(lastRes.startTime, 'HH:mm', new Date());
              const end = parse(lastRes.endTime, 'HH:mm', new Date());
              const diffMins = (end.getTime() - start.getTime()) / 60000;
              if (diffMins > 0) {
                lastDuration = diffMins;
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch last reservation duration", e);
        }

        if (isTopSearch) {
          navigate(`/admin/${clinicId}/patient/${patient.id}`);
        } else {
          setModalData(prev => {
            let newEndTime = prev.endTime;
            if (prev.startTime) {
              newEndTime = format(addMinutes(parse(prev.startTime, 'HH:mm', new Date()), lastDuration), 'HH:mm');
            }
            return {
              ...prev,
              patientId: patient.patientId,
              patientDocId: patient.id,
              patientName: patient.name,
              endTime: newEndTime,
              memo: prev.memo ? `${prev.memo}\n${patient.notes}` : patient.notes
            };
          });
          setPatientNotFound(false);
        }
      } else {
        if (!isTopSearch) {
          setPatientNotFound(true);
          setModalData(prev => ({ ...prev, patientId: idNum, patientDocId: undefined, patientName: '' }));
        } else {
          alert('患者が見つかりませんでした。');
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `clinics/${clinicId}/patients`);
    }
  };

  const handleCreatePatient = async () => {
    if (!clinicId) return;
    
    try {
      // 1. トランザクションで患者番号を自動採番
      const counterRef = doc(db, `clinics/${clinicId}/counters`, 'patientId');
      
      const newPatientId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let currentId = 0;
        
        if (counterDoc.exists()) {
          currentId = counterDoc.data().current || 0;
        }
        
        const nextId = currentId + 1;
        
        // カウンターを更新
        transaction.set(counterRef, { current: nextId }, { merge: true });
        
        return nextId;
      });

      const newRef = doc(collection(db, `clinics/${clinicId}/patients`));
      await setDoc(newRef, {
        patientId: newPatientId,
        name: modalData.patientName || '新規患者',
        phoneNumber: '',
        notes: '',
        visitHistory: [],
        contraindications: '',
        lastVisit: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setPatientNotFound(false);
      setSearchPatientId(newPatientId.toString());
      setModalData(prev => ({ ...prev, patientId: newPatientId, patientDocId: newRef.id }));
      alert(`患者番号 ${newPatientId} で新規登録しました。`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `clinics/${clinicId}/patients`);
    }
  };

  const isTimeSlotAvailable = (staffId: string, start: string, end: string, excludeReservationId?: string) => {
    const startMins = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
    const endMins = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);

    return !reservations.some(r => {
      if (r.status === 'cancelled') return false;
      if (r.staffId !== staffId) return false;
      if (excludeReservationId && r.id === excludeReservationId) return false;

      const rStartMins = parseInt(r.startTime.split(':')[0]) * 60 + parseInt(r.startTime.split(':')[1]);
      const rEndMins = parseInt(r.endTime.split(':')[0]) * 60 + parseInt(r.endTime.split(':')[1]);

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      return startMins < rEndMins && endMins > rStartMins;
    });
  };

  const handleSaveReservation = async () => {
    if (!clinicId || !modalData.staffId || !modalData.startTime || !modalData.endTime) {
      alert('担当スタッフ、開始時間、終了時間は必須です。');
      return;
    }

    const targetDate = modalData.date || format(selectedDate, 'yyyy-MM-dd');

    // Business hours and holidays check
    const timeValidation = validateReservationTime(targetDate, modalData.startTime, modalData.endTime, settings, !editingReservation);
    if (!timeValidation.isValid) {
      alert(timeValidation.error);
      return;
    }

    // Staff shift check
    const targetStaff = staffList.find(s => s.id === modalData.staffId);
    const staffValidation = checkStaffAvailability(targetDate, modalData.startTime, modalData.endTime, targetStaff);
    if (!staffValidation.isValid) {
      alert(staffValidation.error);
      return;
    }

    // Double booking check
    if (!isTimeSlotAvailable(modalData.staffId, modalData.startTime, modalData.endTime, editingReservation?.id)) {
      alert('選択された時間は既に予約が埋まっています。別の時間を選択してください。');
      return;
    }

    try {
      validateClinicId(clinicId);

      const saveData = {
        ...modalData,
        patientName: modalData.patientName || '',
        patientId: modalData.patientId || null,
        patientDocId: modalData.patientDocId || null,
        category: modalData.category || '',
        updatedAt: Timestamp.now()
      };

      if (editingReservation) {
        // Update
        await safeUpdateDoc(
          clinicId!,
          `clinics/${clinicId}/reservations`,
          editingReservation.id,
          saveData,
          'reservation_update',
          `${modalData.patientName}様の予約を変更しました (${modalData.date} ${modalData.startTime})`,
          'canManageReservations'
        );
      } else {
        // Create
        const accessToken = generateAccessToken();
        const questionnaireUrl = `${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${undefined}&token=${accessToken}`;
        
        const createData = {
          ...saveData,
          status: modalData.patientName ? 'confirmed' : 'provisional',
          visitStatus: 'not_arrived',
          selfMenus: [],
          selfTotal: 0,
          grandTotal: 0,
          paymentMethod: 'cash',
          accessToken,
          createdAt: Timestamp.now()
        };
        
        const docRef = await safeAddDoc(
          clinicId!,
          `clinics/${clinicId}/reservations`,
          createData,
          'reservation_create',
          `${modalData.patientName}様の予約を作成しました (${modalData.date} ${modalData.startTime})`,
          'canManageReservations'
        );

        // ID確定後に正式なURLを保存 (questionnaireUrlはIDが必要なため、一度作成してから更新)
        const finalUrl = `${window.location.origin}/patient/questionnaire?clinicId=${clinicId}&reservationId=${docRef.id}&token=${accessToken}`;
        await safeUpdateDoc(
          clinicId!,
          `clinics/${clinicId}/reservations`,
          docRef.id,
          { questionnaireUrl: finalUrl }
        );
      }

      // Update patient's lastVisit if patientId is present
      if (modalData.patientId) {
        const q = query(collection(db, `clinics/${clinicId}/patients`), where('patientId', '==', modalData.patientId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const patientDoc = snapshot.docs[0];
          await safeUpdateDoc(
            clinicId!,
            `clinics/${clinicId}/patients`,
            patientDoc.id,
            {
              lastVisit: Timestamp.fromDate(new Date(`${modalData.date}T${modalData.startTime}`)),
              updatedAt: Timestamp.now()
            }
          );
        }
      }

      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || '予約の保存に失敗しました。');
      handleFirestoreError(error, editingReservation ? OperationType.UPDATE : OperationType.CREATE, `clinics/${clinicId}/reservations`);
    }
  };

  const handleDeleteReservation = async () => {
    if (!clinicId || !editingReservation) return;
    
    // Role check
    if (userProfile?.role === 'staff') {
      alert('スタッフ権限では予約のキャンセルはできません。管理者に依頼してください。');
      return;
    }

    if (window.confirm('本当にこの予約をキャンセルしますか？')) {
      try {
        await safeUpdateDoc(
          clinicId,
          `clinics/${clinicId}/reservations`,
          editingReservation.id,
          {
            status: 'cancelled',
            updatedAt: Timestamp.now()
          },
          'reservation_delete',
          `${editingReservation.patientName}様の予約をキャンセルしました`
        );
        setIsModalOpen(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}/reservations/${editingReservation.id}`);
      }
    }
  };

  const handleStatusTransition = async (newStatus: 'not_arrived' | 'arrived' | 'waiting_for_payment' | 'completed') => {
    if (!clinicId || !editingReservation) return;
    try {
      await safeUpdateDoc(
        clinicId,
        `clinics/${clinicId}/reservations`,
        editingReservation.id,
        {
          visitStatus: newStatus,
          updatedAt: Timestamp.now()
        },
        'reservation_update',
        `${editingReservation.patientName}様のステータスを更新しました`,
        'canManageReservations'
      );
      // Update local state to reflect immediately in modal if it stays open
      setModalData({ ...modalData, visitStatus: newStatus });
      setEditingReservation({ ...editingReservation, visitStatus: newStatus });
      
      // Close modal if completed
      if (newStatus === 'completed') {
        setIsModalOpen(false);
      }
    } catch (error: any) {
      alert(error.message || 'ステータスの更新に失敗しました。');
      handleFirestoreError(error, OperationType.UPDATE, `clinics/${clinicId}/reservations/${editingReservation.id}`);
    }
  };

  const TIME_OPTIONS = useMemo(() => {
    const slots = [];
    let current = new Date(2000, 0, 1, 9, 0);
    const end = new Date(2000, 0, 1, 20, 0);
    while (current <= end) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, 30);
    }
    return slots;
  }, []);

  const isStartTimeDisabled = (time: string) => {
    if (!modalData.staffId) return false;
    // Check if a 30-min slot starting at `time` is available
    const end = format(addMinutes(parse(time, 'HH:mm', new Date()), 30), 'HH:mm');
    return !isTimeSlotAvailable(modalData.staffId, time, end, editingReservation?.id);
  };

  const isEndTimeDisabled = (time: string) => {
    if (!modalData.staffId || !modalData.startTime) return false;
    if (time <= modalData.startTime) return true;
    // Check if the range from startTime to this time is available
    return !isTimeSlotAvailable(modalData.staffId, modalData.startTime, time, editingReservation?.id);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-stone-800">今日の予約状況</h2>
            <div className="flex items-center gap-2 mt-1">
              {getJapaneseHolidayName(format(selectedDate, 'yyyy-MM-dd')) && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full border w-fit holiday-text bg-white border-stone-200">
                  祝: {getJapaneseHolidayName(format(selectedDate, 'yyyy-MM-dd'))}
                  {settings?.closeOnNationalHolidays && "（休診日）"}
                </span>
              )}
            </div>
          </div>
          {(() => {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const isSunday = selectedDate.getDay() === 0;
            const isHoliday = !!getJapaneseHolidayName(dateStr);
            const isHolidayClosed = isHoliday && settings?.closeOnNationalHolidays;

            let bgColor = 'bg-stone-100';
            let textColor = 'text-stone-700';
            let iconColor = 'text-stone-500';

            if (isHoliday) {
              textColor = 'holiday-text';
              iconColor = 'holiday-text';
            } else if (isSunday) {
              textColor = 'text-blue-600';
              iconColor = 'text-blue-500';
            }

            return (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${bgColor}`}>
                <CalendarIcon size={18} className={iconColor} />
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className={`bg-transparent border-none outline-none font-bold ${textColor}`}
                />
              </div>
            );
          })()}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={toggleHolidayClosing}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                settings?.closeOnNationalHolidays 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <CalendarIcon size={14} />
              祝日・祭日を休診日にする: {settings?.closeOnNationalHolidays ? 'ON' : 'OFF'}
            </button>
            <span className="text-[9px] text-stone-400 font-medium mr-1">
              ONの場合、祝日は予約不可・休診表示になります
            </span>
          </div>
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl">
            <Search size={16} className="text-stone-400" />
            <input
              type="number"
              placeholder="患者番号で検索"
              value={topSearchPatientId}
              onChange={(e) => setTopSearchPatientId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchPatient(topSearchPatientId, true);
              }}
              className="bg-transparent border-none outline-none text-sm w-32"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> 予約済み
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span> 仮予約
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-stone-600 border-l pl-3 border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReload}
                onChange={(e) => setAutoReload(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
              />
              自動更新(30分)
            </label>
          </div>
          
          <div className="relative border-l pl-3 border-stone-200">
            <button
              onClick={handleOpenNotifications}
              className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            >
              <Bell size={20} />
              {hasUnread && notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 z-50 overflow-hidden">
                <div className="p-3 border-b border-stone-200 bg-stone-50 font-bold text-stone-800">
                  今日の更新履歴
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-stone-500 text-sm">更新履歴はありません</div>
                  ) : (
                    notifications.map(notif => {
                      const time = notif.updatedAt instanceof Timestamp ? format(notif.updatedAt.toDate(), 'HH:mm') : '';
                      let actionText = '更新';
                      if (notif.status === 'cancelled') actionText = 'キャンセル';
                      else if (notif.status === 'provisional') actionText = '仮予約';
                      else if (notif.status === 'confirmed') actionText = '予約確定';
                      
                      return (
                        <div key={notif.id} className="p-3 border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => handleReservationClick(notif)}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{actionText}</span>
                            <span className="text-xs text-stone-400">{time}</span>
                          </div>
                          <div className="text-sm font-medium text-stone-800">{notif.patientName || '名前なし'} 様</div>
                          <div className="text-xs text-stone-500 mt-1">{notif.date} {notif.startTime}〜</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleAddReservation(staffList[0]?.id || '', '09:00')}
            disabled={settings?.closeOnNationalHolidays && !!getJapaneseHolidayName(format(selectedDate, 'yyyy-MM-dd'))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors shadow-sm ${
              settings?.closeOnNationalHolidays && getJapaneseHolidayName(format(selectedDate, 'yyyy-MM-dd'))
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">予約を追加</span>
          </button>
        </div>
      </div>

      {settings?.closeOnNationalHolidays && getJapaneseHolidayName(format(selectedDate, 'yyyy-MM-dd')) && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={24} className="shrink-0" />
          <div>
            <p className="text-sm font-black">
              本日は祝日（{getJapaneseHolidayName(format(selectedDate, 'yyyy-MM-dd'))}）のため【休診日】です。
            </p>
            <p className="text-xs mt-0.5 opacity-80">
              設定により新規予約の作成はできません。
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 min-h-0">
        <Timeline
          staffList={staffList}
          reservations={reservations}
          date={selectedDate}
          onAddReservation={handleAddReservation}
          onReservationClick={handleReservationClick}
          onReservationMove={handleReservationMove}
        />
      </div>

      {/* Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                {editingReservation ? <FileText className="text-emerald-600" /> : <Plus className="text-emerald-600" />}
                {editingReservation ? '予約詳細・編集' : '新規予約追加'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Status Transition (Only for editing existing reservations) */}
              {editingReservation && modalData.patientName && (
                <div className="bg-stone-100 p-4 rounded-2xl border border-stone-200 flex flex-col items-center justify-center gap-3">
                  {modalData.visitStatus === 'not_arrived' && (
                    <button
                      onClick={() => handleStatusTransition('arrived')}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                      <User size={24} />
                      来院受付する
                    </button>
                  )}
                  {modalData.visitStatus === 'arrived' && (
                    <>
                      <button
                        onClick={() => handleStatusTransition('waiting_for_payment')}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={24} />
                        施術を完了する
                      </button>
                      <button onClick={() => handleStatusTransition('not_arrived')} className="text-xs text-stone-500 underline hover:text-stone-700">
                        1つ前の状態（未来院）に戻す
                      </button>
                    </>
                  )}
                  {modalData.visitStatus === 'waiting_for_payment' && (
                    <>
                      <button
                        onClick={() => handleStatusTransition('completed')}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                      >
                        <FileText size={24} />
                        会計して完了する
                      </button>
                      <button onClick={() => handleStatusTransition('arrived')} className="text-xs text-stone-500 underline hover:text-stone-700">
                        1つ前の状態（来院済）に戻す
                      </button>
                    </>
                  )}
                  {modalData.visitStatus === 'completed' && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-emerald-600 font-bold flex items-center gap-2 text-lg">
                        <CheckCircle2 size={24} />
                        完了済
                      </div>
                      <button onClick={() => handleStatusTransition('waiting_for_payment')} className="text-xs text-stone-500 underline hover:text-stone-700">
                        1つ前の状態（会計待）に戻す
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Time & Staff */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600 flex items-center gap-2"><Clock size={16}/> 時間</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={modalData.startTime || ''}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        let durationMins = 30;
                        if (modalData.startTime && modalData.endTime) {
                          const start = parse(modalData.startTime, 'HH:mm', new Date());
                          const end = parse(modalData.endTime, 'HH:mm', new Date());
                          const diff = (end.getTime() - start.getTime()) / 60000;
                          if (diff > 0) durationMins = diff;
                        }
                        const newEnd = format(addMinutes(parse(newStart, 'HH:mm', new Date()), durationMins), 'HH:mm');
                        setModalData({ ...modalData, startTime: newStart, endTime: newEnd });
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    >
                      <option value="" disabled>開始</option>
                      {TIME_OPTIONS.slice(0, -1).map(time => (
                        <option key={time} value={time} disabled={isStartTimeDisabled(time)}>
                          {time} {isStartTimeDisabled(time) ? '(予約済)' : ''}
                        </option>
                      ))}
                    </select>
                    <span className="text-stone-400">〜</span>
                    <select
                      value={modalData.endTime || ''}
                      onChange={(e) => setModalData({ ...modalData, endTime: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    >
                      <option value="" disabled>終了</option>
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time} disabled={isEndTimeDisabled(time)}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[10, 20, 30, 40, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          if (modalData.startTime) {
                            const newEnd = format(addMinutes(parse(modalData.startTime, 'HH:mm', new Date()), mins), 'HH:mm');
                            setModalData({ ...modalData, endTime: newEnd });
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 border border-stone-200 transition-colors"
                      >
                        {mins}分
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-600 flex items-center gap-2"><User size={16}/> 担当スタッフ</label>
                  <select
                    value={modalData.staffId || ''}
                    onChange={(e) => setModalData({ ...modalData, staffId: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                  >
                    {staffList.filter(s => s.isActive).map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Patient Search */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                  患者番号 <span className="text-xs font-normal text-stone-400">（Enterで検索）</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="number"
                      placeholder="例：12345"
                      value={searchPatientId}
                      onChange={(e) => {
                        setSearchPatientId(e.target.value);
                        setPatientNotFound(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchPatient(searchPatientId);
                        }
                      }}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleSearchPatient(searchPatientId)}
                    className="bg-stone-200 text-stone-700 px-4 py-3 rounded-xl font-bold hover:bg-stone-300 transition-colors whitespace-nowrap"
                  >
                    検索
                  </button>
                </div>
                {patientNotFound && (
                  <div className="flex items-center justify-between bg-orange-50 border border-orange-200 p-3 rounded-xl mt-2">
                    <div className="text-sm text-orange-700 font-medium flex items-center gap-2">
                      <AlertCircle size={16} />
                      患者が見つかりません
                    </div>
                    <button
                      onClick={handleCreatePatient}
                      className="flex items-center gap-1 text-sm bg-orange-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-orange-700 transition-colors"
                    >
                      <UserPlus size={14} /> 新規登録
                    </button>
                  </div>
                )}
                {modalData.patientId && !patientNotFound && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl mt-2">
                    <div className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      患者番号: {modalData.patientId} が選択されています
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate(`/admin/${clinicId}/patient/${modalData.patientId}`)}
                        className="text-sm text-emerald-700 underline hover:text-emerald-800 font-bold"
                      >
                        カルテを見る
                      </button>
                      <button
                        onClick={() => navigate(`/admin/${clinicId}/patient/${modalData.patientId}?newRecord=true&reservationId=${editingReservation?.id || ''}`)}
                        className="text-sm text-emerald-700 underline hover:text-emerald-800 font-bold"
                      >
                        カルテを作成
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                  患者様名 <span className="text-xs font-normal text-stone-400">（未入力で仮予約になります）</span>
                </label>
                <input
                  type="text"
                  placeholder="例：山田 太郎"
                  value={modalData.patientName || ''}
                  onChange={(e) => setModalData({ ...modalData, patientName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Treatment Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">施術区分</label>
                <select
                  value={modalData.category || ''}
                  onChange={(e) => setModalData({ ...modalData, category: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                >
                  <option value="">未設定</option>
                  <option value="jusei">柔整</option>
                  <option value="shinkyu">鍼灸</option>
                </select>
              </div>

              {/* Menu */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">施術メニュー</label>
                <input
                  type="text"
                  placeholder="例：全身調整コース"
                  value={modalData.menu || ''}
                  onChange={(e) => setModalData({ ...modalData, menu: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Memo */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-600 flex items-center gap-2">メモ・備考</label>
                <textarea
                  rows={3}
                  placeholder="特記事項があれば入力してください"
                  value={modalData.memo || ''}
                  onChange={(e) => setModalData({ ...modalData, memo: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-medium text-stone-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50 flex items-center justify-between gap-4">
              {editingReservation ? (
                <button
                  onClick={handleDeleteReservation}
                  className="text-red-600 font-bold px-4 py-3 hover:bg-red-50 rounded-xl transition-colors"
                >
                  キャンセル（削除）
                </button>
              ) : <div></div>}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  閉じる
                </button>
                <button
                  onClick={handleSaveReservation}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-colors shadow-sm ${
                    modalData.patientName ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {modalData.patientName ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  {modalData.patientName ? '本予約として保存' : '仮予約として保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
