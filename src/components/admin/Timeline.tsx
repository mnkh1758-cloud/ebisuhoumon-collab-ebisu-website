import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AdminStaff, Reservation, DayOfWeek, DailySchedule } from '../../types';
import { format, parse, addMinutes } from 'date-fns';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface TimelineProps {
  staffList: AdminStaff[];
  reservations: Reservation[];
  date: Date;
  onAddReservation: (staffId: string, time: string) => void;
  onReservationClick: (reservation: Reservation) => void;
  onReservationMove: (reservationId: string, newStaffId: string, newStartTime: string) => void;
}

const START_HOUR = 9;
const END_HOUR = 20;
const SLOT_MINUTES = 30;

// Generate time slots
const generateTimeSlots = () => {
  const slots = [];
  let current = new Date(2000, 0, 1, START_HOUR, 0);
  const end = new Date(2000, 0, 1, END_HOUR, 0);

  while (current < end) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, SLOT_MINUTES);
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

export type UnavailableBlockType = 'off' | 'break';

export interface UnavailableBlock {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  type: UnavailableBlockType;
}

export function generateUnavailableBlocks(
  daily: DailySchedule | undefined,
  clinicOpen: string,
  clinicClose: string
): UnavailableBlock[] {
  const blocks: UnavailableBlock[] = [];

  if (!daily || !daily.isWorking) {
    blocks.push({ start: clinicOpen, end: clinicClose, type: 'off' });
    return blocks;
  }

  if (daily.start > clinicOpen) {
    blocks.push({ start: clinicOpen, end: daily.start, type: 'off' });
  }

  if (daily.breakStart && daily.breakEnd) {
    blocks.push({ start: daily.breakStart, end: daily.breakEnd, type: 'break' });
  }

  if (daily.end < clinicClose) {
    blocks.push({ start: daily.end, end: clinicClose, type: 'off' });
  }

  return blocks;
}

const StaffBackgroundLayer = ({
  dailySchedule,
  clinicOpen,
  clinicClose,
}: {
  dailySchedule: DailySchedule | undefined;
  clinicOpen: string;
  clinicClose: string;
}) => {
  const blocks = useMemo(() => {
    const res = generateUnavailableBlocks(dailySchedule, clinicOpen, clinicClose);
    console.log('generateUnavailableBlocks result:', res);
    return res;
  }, [dailySchedule, clinicOpen, clinicClose]);

  if (blocks.length === 0) return null;

  const timeToPixels = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = START_HOUR * 60; // 9 * 60 = 540
    return 128 + (totalMinutes - startMinutes) * 4;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {blocks.map((block, index) => {
        const left = timeToPixels(block.start);
        const right = timeToPixels(block.end);
        const width = Math.max(0, right - left);

        console.log(`Block ${index}: start=${block.start}, end=${block.end}, left=${left}, width=${width}`);

        if (width <= 0) return null;

        return (
          <div
            key={`${block.type}-${index}`}
            className={`absolute h-full border-r border-white/50 ${
              block.type === 'off' 
                ? 'bg-red-100/80' // TODO: change to bg-gray-100/80 after confirmation
                : 'bg-yellow-100/80' // TODO: change to bg-amber-50/60 after confirmation
            }`}
            style={{
              left: `${left}px`,
              width: `${width}px`,
            }}
          />
        );
      })}
    </div>
  );
};

// Draggable Reservation Card
const DraggableReservation = ({ reservation, staffColor, onClick }: { reservation: Reservation, staffColor: string, onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: reservation.id,
    data: { reservation },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 10,
    opacity: isDragging ? 0.8 : 1,
  };

  const isProvisional = reservation.status === 'provisional';
  
  let bgColor = 'bg-blue-100';
  let borderColor = 'border-blue-400';
  let textColor = 'text-blue-800';

  if (isProvisional) {
    bgColor = 'bg-orange-100';
    borderColor = 'border-orange-500';
    textColor = 'text-orange-800';
  } else {
    if (staffColor.includes('green')) { bgColor = 'bg-green-100'; borderColor = 'border-green-400'; textColor = 'text-green-800'; }
    else if (staffColor.includes('orange')) { bgColor = 'bg-orange-100'; borderColor = 'border-orange-400'; textColor = 'text-orange-800'; }
    else if (staffColor.includes('purple')) { bgColor = 'bg-purple-100'; borderColor = 'border-purple-400'; textColor = 'text-purple-800'; }
    else if (staffColor.includes('pink')) { bgColor = 'bg-pink-100'; borderColor = 'border-pink-400'; textColor = 'text-pink-800'; }
  }

  // Visit Status Color Line
  let statusColorClass = 'bg-stone-300'; // Default: not_arrived (グレー)
  if (reservation.visitStatus === 'arrived') statusColorClass = 'bg-blue-500'; // arrived (青)
  else if (reservation.visitStatus === 'waiting_for_payment') statusColorClass = 'bg-orange-500'; // waiting_for_payment (オレンジ)
  else if (reservation.visitStatus === 'completed') statusColorClass = 'bg-emerald-500'; // completed (緑)

  // Calculate height based on duration
  const start = parse(reservation.startTime, 'HH:mm', new Date());
  const end = parse(reservation.endTime, 'HH:mm', new Date());
  const durationMins = (end.getTime() - start.getTime()) / 60000;
  const slotCount = durationMins / SLOT_MINUTES;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, width: `${slotCount * 120}px` }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent drag click
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`absolute top-1 bottom-1 left-1 right-1 rounded-md border-l-4 p-2 shadow-sm cursor-grab active:cursor-grabbing overflow-hidden flex ${bgColor} ${borderColor} ${textColor}`}
    >
      <div className={`w-1.5 h-full absolute left-0 top-0 bottom-0 ${statusColorClass}`} />
      <div className="pl-2 w-full">
        <div className="text-xs font-bold truncate">{reservation.patientName || '仮予約'}</div>
        <div className="text-[10px] truncate opacity-80">{reservation.menu || 'メニュー未定'}</div>
      </div>
    </div>
  );
};

// Droppable Slot
const DroppableSlot = ({ id, staffId, time, children, onClick, isBooked }: { id: string, staffId: string, time: string, children: React.ReactNode, onClick: () => void, isBooked?: boolean }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { staffId, time },
    disabled: isBooked,
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={`relative min-w-[120px] h-20 border-r border-b border-stone-200 transition-colors ${
        isBooked ? 'bg-stone-200 cursor-not-allowed' : isOver ? 'bg-emerald-50 cursor-pointer' : 'bg-transparent hover:bg-stone-100/50 cursor-pointer'
      }`}
    >
      {children}
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({
  staffList,
  reservations,
  date,
  onAddReservation,
  onReservationClick,
  onReservationMove,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag to activate
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const reservationId = active.id as string;
      const { staffId, time } = over.data.current as { staffId: string, time: string };
      onReservationMove(reservationId, staffId, time);
    }
  };

  const activeStaff = staffList.filter(s => s.isActive).sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="min-w-max h-full flex flex-col">
            {/* Header Row (Time) */}
            <div className="flex border-b border-stone-200 bg-stone-100 sticky top-0 z-20">
              <div className="w-32 shrink-0 border-r border-stone-200 p-4 font-bold text-stone-600 sticky left-0 bg-stone-100 z-30">
                スタッフ / 時間
              </div>
              {TIME_SLOTS.map((time) => (
                <div key={time} className="min-w-[120px] p-2 text-center text-sm font-bold text-stone-600 border-r border-stone-200">
                  {time}
                </div>
              ))}
            </div>

            {/* Staff Rows */}
            <div className="flex-1 min-h-[500px] relative">
              {activeStaff.map((staff) => {
                const dayOfWeek = getDayOfWeek(date);
                const dailySchedule = staff.schedule?.[dayOfWeek];

                return (
                <div key={staff.id} className="flex group h-20 relative">
                  {/* Background Layer */}
                  <StaffBackgroundLayer 
                    dailySchedule={dailySchedule}
                    clinicOpen="09:00"
                    clinicClose="20:00"
                  />

                  {/* Staff Name Sticky Column */}
                  <div className="w-32 shrink-0 border-r border-b border-stone-200 p-4 sticky left-0 bg-white z-10 flex flex-col justify-center">
                    <div className="font-bold text-stone-800 truncate">{staff.name}</div>
                    <div className="text-xs text-stone-500 truncate">{staff.role}</div>
                  </div>

                  {/* Time Slots for Staff */}
                  {TIME_SLOTS.map((time) => {
                    const slotId = `${staff.id}-${time}`;
                    
                    // Check if this time slot is within any reservation for this staff
                    const timeMins = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
                    const isBooked = reservations.some(r => {
                      if (r.status === 'cancelled' || r.staffId !== staff.id) return false;
                      const rStartMins = parseInt(r.startTime.split(':')[0]) * 60 + parseInt(r.startTime.split(':')[1]);
                      const rEndMins = parseInt(r.endTime.split(':')[0]) * 60 + parseInt(r.endTime.split(':')[1]);
                      return timeMins >= rStartMins && timeMins < rEndMins;
                    });

                    // Find reservation starting at this exact time for this staff
                    const slotReservations = reservations.filter(
                      (r) => r.staffId === staff.id && r.startTime === time && r.status !== 'cancelled'
                    );

                    return (
                      <DroppableSlot
                        key={slotId}
                        id={slotId}
                        staffId={staff.id}
                        time={time}
                        onClick={() => {
                          if (!isBooked) {
                            onAddReservation(staff.id, time);
                          }
                        }}
                        isBooked={isBooked}
                      >
                        {slotReservations.map((res) => (
                          <DraggableReservation
                            key={res.id}
                            reservation={res}
                            staffColor={staff.color}
                            onClick={() => onReservationClick(res)}
                          />
                        ))}
                      </DroppableSlot>
                    );
                  })}
                </div>
              )})}
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
};
