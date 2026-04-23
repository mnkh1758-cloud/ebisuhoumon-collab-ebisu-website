import React, { useState, useRef, useMemo, useEffect } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle2, ChevronRight, Loader2, Table, Settings, Info, ArrowRight, AlertTriangle, ShieldCheck, Database, ListFilter } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, getDocs, doc, runTransaction, setDoc, Timestamp, addDoc } from 'firebase/firestore';
import { CsvPreviewResult, CsvPreviewRow, CsvMapping, MappedPatientData, ImportSummary, Patient, UserProfile, PatientImportLog } from '../../types';

interface CsvImportSectionProps {
  clinicId?: string;
  userProfile?: UserProfile;
}

const PATIENT_FIELDS = [
  { id: 'ignore', label: '（取り込まない）', required: false },
  { id: 'patientName', label: '氏名', required: true },
  { id: 'patientNameKana', label: 'フリガナ', required: false },
  { id: 'phone', label: '電話番号', required: false },
  { id: 'birthDate', label: '生年月日', required: false },
  { id: 'gender', label: '性別', required: false },
  { id: 'postalCode', label: '郵便番号', required: false },
  { id: 'addressText', label: '住所', required: false },
  { id: 'patientCode', label: '患者ID/コード', required: false },
  { id: 'email', label: 'メールアドレス', required: false },
  { id: 'insurerName', label: '保険者名', required: false },
  { id: 'insurerNumber', label: '保険者番号', required: false },
  { id: 'memo', label: '備考', required: false },
];

const AUTO_MAPPING_RULES: Record<string, string> = {
  '氏名': 'patientName', '名前': 'patientName', '患者名': 'patientName', 'name': 'patientName',
  'カナ': 'patientNameKana', 'かな': 'patientNameKana', 'フリガナ': 'patientNameKana', 'furigana': 'patientNameKana',
  '電話': 'phone', 'TEL': 'phone', 'tel': 'phone', '携帯': 'phone', 'phone': 'phone',
  '生年月日': 'birthDate', '誕生日': 'birthDate', 'birthday': 'birthDate', 'birth': 'birthDate',
  '郵便番号': 'postalCode', 'zip': 'postalCode',
  '住所': 'addressText', '連絡先': 'addressText', 'address': 'addressText',
  '患者ID': 'patientCode', '患者番号': 'patientCode', 'ID': 'patientCode', 'id': 'patientCode', 'code': 'patientCode',
  'メール': 'email', 'email': 'email',
};

type ViewMode = 'save_target' | 'exact_match' | 'duplicate' | 'error_skipped';

export const CsvImportSection: React.FC<CsvImportSectionProps> = ({ clinicId, userProfile }) => {
  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResult | null>(null);
  const [allRows, setAllRows] = useState<CsvPreviewRow[]>([]);
  const [existingPatients, setExistingPatients] = useState<Patient[]>([]);
  const [mapping, setMapping] = useState<CsvMapping>({});
  const [viewMode, setViewMode] = useState<ViewMode>('save_target');
  
  const [importing, setImporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    failedCount: number;
    skippedCount: number;
    batchId: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing patients for comparison
  useEffect(() => {
    if (!clinicId) return;
    
    const fetchPatients = async () => {
      setFetchingExisting(true);
      try {
        const querySnapshot = await getDocs(collection(db, `clinics/${clinicId}/patients`));
        const patients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Patient[];
        setExistingPatients(patients);
      } catch (err) {
        console.error('Fetch existing patients error:', err);
      } finally {
        setFetchingExisting(false);
      }
    };

    fetchPatients();
  }, [clinicId]);

  // Auto-suggestion logic when preview changes
  useEffect(() => {
    if (preview) {
      const newMapping: CsvMapping = {};
      preview.headers.forEach(header => {
        const found = Object.keys(AUTO_MAPPING_RULES).find(key => 
          header.includes(key) || key.includes(header)
        );
        if (found) {
          newMapping[header] = AUTO_MAPPING_RULES[found];
        } else {
          newMapping[header] = 'ignore';
        }
      });
      setMapping(newMapping);
    }
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setPreview(null);
    setAllRows([]);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setError('データが見つかりませんでした');
          setLoading(false);
          return;
        }

        const cleanedText = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        const lines = cleanedText.split("\n").filter(line => line.trim() !== "");
        
        if (lines.length < 1) {
          setError('データが空です');
          setLoading(false);
          return;
        }

        const headers = splitCSVLine(lines[0]);
        const dataLines = lines.slice(1);
        
        const rows: CsvPreviewRow[] = dataLines.map(line => {
          const parts = splitCSVLine(line);
          const row: CsvPreviewRow = {};
          headers.forEach((header, index) => {
            row[header] = parts[index] || "";
          });
          return row;
        });

        setAllRows(rows);
        setPreview({
          fileName: file.name,
          rowCount: rows.length,
          headers,
          previewRows: rows.slice(0, 10)
        });
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        setError('CSVの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('ファイルの読み取り中にエラーが発生しました');
      setLoading(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let curVal = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(curVal.trim().replace(/^"|"$/g, ""));
        curVal = '';
      } else {
        curVal += char;
      }
    }
    result.push(curVal.trim().replace(/^"|"$/g, ""));
    return result;
  };

  // Helpers for normalization (for comparison only)
  // 将来：正規化ON/OFF切替UI追加可能
  // 将来：より高度な名寄せロジックへ拡張可能
  const normalizePhone = (phone?: string) => {
    if (!phone) return '';
    return phone
      .trim()
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) // 全角数字 -> 半角
      .replace(/[ー－―━—]/g, '-') // 様々なハイフン -> 半角ハイフンベース
      .replace(/[- ]/g, ''); // ハイフン・空白除去
  };

  const normalizeBirthDate = (date?: string) => {
    if (!date) return '';
    return date
      .trim()
      .replace(/\//g, '-') // / -> -
      .replace(/年|月/g, '-') // 年, 月 -> -
      .replace(/日/g, '') // 日 -> 除去
      .replace(/-+/g, '-') // 重複ハイフン集約
      .replace(/-$/, ''); // 末尾ハイフン除去
  };

  const normalizeName = (name?: string) => {
    if (!name) return '';
    return name
      .trim()
      .replace(/　/g, ''); // 全角スペース除去
  };

  // --- Step 3 Logic: Firestore-aware Mapping & Summary ---
  const { summary, transformedData, mappingWarnings, riskFlags } = useMemo(() => {
    if (!preview || allRows.length === 0) return { summary: null, transformedData: [], mappingWarnings: [], riskFlags: [] };

    const warnings: string[] = [];
    const globalRiskFlags: string[] = [];
    const usedFields = Object.values(mapping).filter(v => v !== 'ignore');
    
    // Check missing required
    const requiredMissing = PATIENT_FIELDS.filter(f => f.required && !usedFields.includes(f.id));
    if (requiredMissing.length > 0) {
      const labels = requiredMissing.map(f => f.label).join(', ');
      warnings.push(`必須項目「${labels}」が割り当てられていません`);
      globalRiskFlags.push(`missing_mapping_${requiredMissing[0].id}`);
    }

    // Check duplicate mappings
    const duplicates = usedFields.filter((f, i) => usedFields.indexOf(f) !== i);
    if (duplicates.length > 0) {
      const dupeLabels = PATIENT_FIELDS.filter(f => duplicates.includes(f.id)).map(f => f.label);
      warnings.push(`項目「${dupeLabels.join(', ')}」に複数の列が割り当てられています`);
      globalRiskFlags.push('duplicate_mapping');
    }

    // Prepare indices for faster comparison
    const existingCodeMap = new Map(existingPatients.filter(p => !!p.patientId).map(p => [p.patientId.toString(), p]));
    // Also support patientCode if defined as string in some systems, but our Patient type uses patientId: number
    // We'll treat the CSV input as possible match for the numbered id or a string code if we have one.

    const transformed: MappedPatientData[] = [];
    let emptyCount = 0;
    let missingRequiredCount = 0;
    
    // Internal Duplicate Check (CSV intra-file)
    const csvCodeSet = new Set<string>();
    const csvNamePhoneSet = new Set<string>();

    allRows.forEach((rawRow, index) => {
      if (Object.values(rawRow).every(v => !v.trim())) {
        emptyCount++;
        return;
      }

      const entry: MappedPatientData = { 
        originalRowIndex: index,
        riskFlags: []
      };
      let hasRequired = true;

      PATIENT_FIELDS.forEach(field => {
        if (field.id === 'ignore') return;
        const header = preview.headers.find(h => mapping[h] === field.id);
        if (header) {
          const val = rawRow[header]?.trim();
          (entry as any)[field.id] = val || undefined;
          if (field.required && !val) hasRequired = false;
        } else if (field.required) {
          hasRequired = false;
        }
      });

      if (!hasRequired) {
        entry.status = 'missing_required';
        entry.riskFlags?.push('missing_patient_name');
        missingRequiredCount++;
      } else {
        // ---本判定判定ロジック ---
        const code = entry.patientCode;
        const name = normalizeName(entry.patientName);
        const phone = normalizePhone(entry.phone);
        const birth = normalizeBirthDate(entry.birthDate);

        // Internal CSV Duplicate check
        if (code && csvCodeSet.has(code)) {
          entry.status = 'skipped_by_risk';
          entry.riskFlags?.push('internal_duplicate_in_csv');
          entry.matchReason = 'CSVファイル内で患者IDが重複しています';
        } else if (name && phone && csvNamePhoneSet.has(`${name}-${phone}`)) {
          entry.status = 'skipped_by_risk';
          entry.riskFlags?.push('internal_duplicate_in_csv');
          entry.matchReason = 'CSVファイル内で氏名と電話番号の組み合わせが重複しています';
        } 
        // Firestore Comparison
        else {
          // 1. patientCode (patientId) 一致
          const matchByCode = code ? existingPatients.find(p => p.patientId.toString() === code) : null;
          if (matchByCode) {
            entry.status = 'exact_match';
            entry.matchReason = `患者番号が既存の「${matchByCode.name}」と一致しました`;
          } else {
            // 2. phone + name + birthDate 一致 (High Precision)
            const highMatch = existingPatients.find(p => 
              normalizePhone(p.phoneNumber) === phone && 
              normalizeName(p.name) === name && 
              normalizeBirthDate((p as any).birthDate) === birth
            );
            
            if (highMatch) {
              entry.status = 'exact_match';
              entry.matchReason = '電話番号、氏名、生年月日が既存患者と完全に一致しました';
            } else {
              // 3. Duplicate Candidates
              const phoneMatch = phone ? existingPatients.find(p => normalizePhone(p.phoneNumber) === phone && normalizeName(p.name) === name) : null;
              if (phoneMatch) {
                entry.status = 'duplicate_high';
                entry.matchReason = '電話番号と氏名が一致する既存患者がいます';
              } else {
                const nameBirthMatch = (name && birth) ? existingPatients.find(p => normalizeName(p.name) === name && normalizeBirthDate((p as any).birthDate) === birth) : null;
                if (nameBirthMatch) {
                  entry.status = 'duplicate_high';
                  entry.matchReason = '氏名と生年月日が一致する既存患者がいます';
                } else {
                  const nameOnlyMatch = existingPatients.find(p => normalizeName(p.name) === name);
                  if (nameOnlyMatch) {
                    entry.status = 'duplicate_low';
                    entry.matchReason = '氏名が一致する既存患者がいます';
                  } else {
                    entry.status = 'valid_new';
                  }
                }
              }
            }
          }
        }

        // Add to intra-csv sets
        if (code) csvCodeSet.add(code);
        if (name && phone) csvNamePhoneSet.add(`${name}-${phone}`);
      }

      transformed.push(entry);
    });

    if (transformed.some(d => d.status === 'exact_match')) globalRiskFlags.push('exact_match_found');
    if (transformed.some(d => d.status?.startsWith('duplicate'))) globalRiskFlags.push('duplicate_candidate_found');
    if (csvCodeSet.size < allRows.filter(r => !!mapping[preview.headers.find(h => mapping[h] === 'patientCode') || ''] && !!r[preview.headers.find(h => mapping[h] === 'patientCode') || '']).length) {
       globalRiskFlags.push('internal_duplicate_in_csv');
    }

    const sum: ImportSummary = {
      totalRows: allRows.length,
      emptyRows: emptyCount,
      validRows: transformed.filter(d => d.status === 'valid_new').length,
      missingRequiredRows: missingRequiredCount,
      newCandidates: transformed.filter(d => d.status === 'valid_new').length,
      duplicateCandidates: transformed.filter(d => d.status?.startsWith('duplicate')).length,
      completeMatches: transformed.filter(d => d.status === 'exact_match').length,
    };

    return { summary: sum, transformedData: transformed, mappingWarnings: warnings, riskFlags: globalRiskFlags };
  }, [allRows, mapping, preview, existingPatients]);

  const handleMappingChange = (header: string, fieldId: string) => {
    setMapping(prev => ({ ...prev, [header]: fieldId }));
  };

  const executeImport = async () => {
    if (!clinicId || !userProfile) return;
    const targets = transformedData.filter(d => d.status === 'valid_new');
    if (targets.length === 0) return;

    setShowConfirmModal(false);
    setImporting(true);
    let success = 0;
    let failed = 0;
    const batchId = `import_${Date.now()}`;

    try {
      for (const entry of targets) {
        try {
          // 1. Transaction for patientId
          const counterRef = doc(db, `clinics/${clinicId}/counters`, 'patientId');
          const newId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            const current = counterDoc.exists() ? counterDoc.data().current || 0 : 0;
            const next = current + 1;
            transaction.set(counterRef, { current: next }, { merge: true });
            return next;
          });

          // 2. Create Patient
          const patientData: any = {
            patientId: newId,
            name: entry.patientName || '',
            phoneNumber: entry.phone || '',
            notes: `[CSVインポート ${new Date().toLocaleDateString()}] ${entry.memo || ''}`.trim(),
            visitHistory: [],
            contraindications: '',
            lastVisit: null,
            importBatchId: batchId,
            importSource: 'csv' as const,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };

          // Add extra fields if available
          if (entry.patientNameKana) patientData.kana = entry.patientNameKana;
          if (entry.birthDate) patientData.birthDate = entry.birthDate;
          if (entry.gender) patientData.gender = entry.gender;
          if (entry.addressText) patientData.address = entry.addressText;
          if (entry.email) patientData.email = entry.email;

          await addDoc(collection(db, `clinics/${clinicId}/patients`), patientData);
          entry.status = 'success';
          success++;
        } catch (err) {
          console.error('Individual save error:', err);
          entry.status = 'failed';
          failed++;
        }
      }

      // 3. Save Log
      const logData: Omit<PatientImportLog, 'id'> = {
        importBatchId: batchId,
        importedAt: Timestamp.now(),
        importedBy: userProfile.uid,
        sourceType: 'csv',
        fileName: preview?.fileName || 'unknown',
        totalRows: allRows.length,
        savedCount: success,
        exactMatchCount: summary?.completeMatches || 0,
        duplicateCount: summary?.duplicateCandidates || 0,
        missingRequiredCount: summary?.missingRequiredRows || 0,
        invalidCount: 0,
        skippedCount: (summary?.totalRows || 0) - success,
        mappingSummary: mapping,
        riskFlags: riskFlags,
        status: failed === 0 ? 'completed' : 'partial'
      };

      await addDoc(collection(db, `clinics/${clinicId}/importLogs`), logData);

      setImportResult({
        successCount: success,
        failedCount: failed,
        skippedCount: (summary?.totalRows || 0) - success - failed,
        batchId
      });

    } catch (err) {
      console.error('Import process error:', err);
      alert('インポート処理中に予期せぬエラーが発生しました');
    } finally {
      setImporting(false);
    }
  };

  const filteredViewData = useMemo(() => {
    switch (viewMode) {
      case 'save_target': return transformedData.filter(d => d.status === 'valid_new' || d.status === 'success' || d.status === 'failed');
      case 'exact_match': return transformedData.filter(d => d.status === 'exact_match');
      case 'duplicate': return transformedData.filter(d => d.status?.startsWith('duplicate'));
      case 'error_skipped': return transformedData.filter(d => d.status === 'missing_required' || d.status === 'skipped_by_risk');
      default: return [];
    }
  }, [transformedData, viewMode]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl">
      <div className="max-w-3xl">
        <h3 className="text-xl font-black text-stone-800 mb-2">CSV取り込み</h3>
        <p className="text-sm text-stone-500 font-bold leading-relaxed">
          既存の患者データと照合し、新規の患者のみを登録します。既存データへの上書きは行われません。
        </p>
      </div>

      {!preview && !loading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="max-w-2xl border-4 border-dashed border-stone-100 bg-stone-50/50 rounded-[2rem] p-12 text-center transition-all cursor-pointer group hover:border-emerald-200 hover:bg-emerald-50/20"
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white text-stone-300 flex items-center justify-center transition-all shadow-lg group-hover:text-emerald-500 group-hover:scale-110">
              <Upload size={32} />
            </div>
            <div>
              <h4 className="font-black text-stone-800 text-lg">CSVファイルを選択</h4>
              <p className="text-sm text-stone-400 font-bold">患者データのCSVをアップロードしてください</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-emerald-600 font-bold animate-pulse py-10">
          <Loader2 className="animate-spin" />
          <span>ファイルを解析中...</span>
        </div>
      )}

      {error && (
        <div className="max-w-2xl p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center gap-4 text-red-700">
          <AlertCircle size={24} />
          <div>
            <div className="font-black">読み込みエラー</div>
            <div className="text-sm font-bold">{error}</div>
          </div>
        </div>
      )}

      {preview && !loading && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FileText size={20} />
              </div>
              <div>
                <div className="text-sm font-black text-stone-800">{preview.fileName}</div>
                <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                  {preview.rowCount.toLocaleString()} lines | 
                  {fetchingExisting ? ' Comparing with Firestore...' : ` Checked against ${existingPatients.length} existing patients`}
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setPreview(null); setMapping({}); setImportResult(null); }}
              className="text-xs font-black text-stone-400 hover:text-red-500 transition-colors"
            >
              ファイルを変更する
            </button>
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Settings className="text-emerald-600" size={20} />
              <h4 className="text-lg font-black text-stone-800">列マッピング</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {preview.headers.map((header) => {
                const targetField = mapping[header] || 'ignore';
                const isAuto = AUTO_MAPPING_RULES[header] || Object.keys(AUTO_MAPPING_RULES).some(k => header.includes(k));
                return (
                  <div key={header} className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm space-y-2">
                    <div className="text-[10px] font-black text-stone-400 truncate tracking-wider" title={header}>{header}</div>
                    <select
                      value={targetField}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className="w-full bg-stone-50 rounded-lg px-2 py-1.5 text-xs font-bold outline-none border-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {PATIENT_FIELDS.map(f => (
                        <option key={f.id} value={f.id}>{f.label}{f.required ? ' *' : ''}</option>
                      ) )}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          {riskFlags.length > 0 && (
            <section className="bg-orange-50 border border-orange-100 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3 text-orange-700">
                <AlertTriangle size={24} />
                <h4 className="font-black">リスクおよび注意フラグ</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskFlags.includes('missing_mapping_patientName') && (
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-800">
                    <ChevronRight size={14} /> 氏名（patientName）の列が割り当てられていません
                  </div>
                )}
                {riskFlags.includes('duplicate_mapping') && (
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-800">
                    <ChevronRight size={14} /> 同じ項目に複数の列が割り当てられています（先勝ち）
                  </div>
                )}
                {riskFlags.includes('exact_match_found') && (
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
                    <ChevronRight size={14} /> 既存患者とデータが完全に一致する行があります（スキップされます）
                  </div>
                )}
                {riskFlags.includes('duplicate_candidate_found') && (
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
                    <ChevronRight size={14} /> 既存患者と情報が重複する候補が見つかりました（スキップされます）
                  </div>
                )}
                {riskFlags.includes('internal_duplicate_in_csv') && (
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-800">
                    <ChevronRight size={14} /> CSVファイル内で複数の行が同じ情報（IDや氏名＋電話）を持っています
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Database className="text-emerald-600" size={20} />
              <h4 className="text-lg font-black text-stone-800">最終インポートサマリー</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: '総行数', value: summary?.totalRows, color: 'text-stone-800' },
                { label: '保存対象 (新規)', value: summary?.newCandidates, color: 'text-emerald-600' },
                { label: '完全一致 (既知)', value: summary?.completeMatches, color: 'text-stone-400' },
                { label: '重複候補', value: summary?.duplicateCandidates, color: 'text-orange-500' },
                { label: '必須不足', value: summary?.missingRequiredRows, color: 'text-red-400' },
                { label: '空行/無効', value: summary?.emptyRows, color: 'text-stone-300' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="text-[10px] text-stone-400 font-black uppercase mb-1">{item.label}</div>
                  <div className={`text-xl font-black ${item.color}`}>{item.value?.toLocaleString() || 0}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6 bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex flex-wrap gap-2">
                {[
                  { id: 'save_target', label: `保存対象 (${summary?.newCandidates || 0})`, icon: CheckCircle2 },
                  { id: 'exact_match', label: `完全一致 (${summary?.completeMatches || 0})`, icon: ShieldCheck },
                  { id: 'duplicate', label: `重複候補 (${summary?.duplicateCandidates || 0})`, icon: Info },
                  { id: 'error_skipped', label: `不足/無効 (${(summary?.missingRequiredRows || 0) + transformedData.filter(d => d.status === 'skipped_by_risk').length})`, icon: AlertCircle },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as ViewMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                      viewMode === tab.id ? 'bg-white text-emerald-700 shadow-sm border border-stone-200' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
             </div>
             <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-stone-50 border-b border-stone-100 z-10">
                    <tr>
                      <th className="px-4 py-3 font-black text-stone-400 uppercase tracking-widest w-12">Row</th>
                      <th className="px-4 py-3 font-black text-stone-600">判定 / 理由</th>
                      <th className="px-4 py-3 font-black text-stone-600">氏名</th>
                      <th className="px-4 py-3 font-black text-stone-600 font-mono">電話番号</th>
                      <th className="px-4 py-3 font-black text-stone-600">生年月日</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredViewData.length > 0 ? filteredViewData.map((row) => (
                      <tr key={row.originalRowIndex} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-stone-300">{row.originalRowIndex + 1}</td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="flex flex-col gap-1">
                            <span className={`font-black text-[10px] w-fit px-1.5 py-0.5 rounded ${
                              row.status === 'success' ? 'bg-emerald-500 text-white' :
                              row.status === 'failed' ? 'bg-red-500 text-white' :
                              row.status === 'valid_new' ? 'text-emerald-700 bg-emerald-50' : 
                              row.status === 'exact_match' ? 'text-stone-500 bg-stone-100' :
                              row.status?.startsWith('duplicate') ? 'text-orange-700 bg-orange-50' : 'text-red-700 bg-red-50'
                            }`}>
                              {row.status === 'success' ? '保存済' : row.status === 'failed' ? '失敗' : 
                               row.status === 'valid_new' ? '保存対象' : 
                               row.status === 'exact_match' ? '完全一致' : 
                               row.status?.startsWith('duplicate') ? '重複候補' : '不備あり'}
                            </span>
                            <span className="text-[10px] text-stone-400 font-bold leading-tight">{row.matchReason || '---'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-black text-stone-700">{row.patientName || '---'}</td>
                        <td className="px-4 py-3 font-bold text-stone-500 font-mono">{row.phone || '---'}</td>
                        <td className="px-4 py-3 font-bold text-stone-500">{row.birthDate || '---'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-stone-400 font-bold">このカテゴリーに該当するデータはありません</td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </section>

          {!importResult ? (
            <div className="flex flex-col items-center gap-4 bg-stone-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="text-center relative z-10 space-y-4">
                  <h4 className="text-2xl font-black tracking-tight">準備が整いました。保存を実行しますか？</h4>
                  <p className="text-emerald-100 font-bold max-w-lg mx-auto">
                    「保存対象」に分類された <span className="text-white text-xl">{summary?.newCandidates || 0}件</span> のみを新規患者として追加します。
                    既存のデータは一切変更されません。
                  </p>
                  <div className="pt-4 flex flex-col items-center gap-3">
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={importing || !summary || summary.newCandidates === 0 || riskFlags.includes('missing_mapping_patientName')}
                      className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 disabled:grayscale"
                    >
                      {importing ? <Loader2 className="animate-spin" /> : <Database size={24} />}
                      {importing ? '保存実行中...' : '保存を開始する'}
                    </button>
                    {riskFlags.includes('missing_mapping_patientName') && (
                      <span className="text-orange-400 text-xs font-bold ring-1 ring-orange-900/50 px-3 py-1 rounded-full bg-orange-950">
                        ※氏名の割り当てが必要です
                      </span>
                    )}
                  </div>
               </div>
            </div>
          ) : (
            <section className="animate-in zoom-in duration-500 bg-white rounded-[2rem] border-4 border-emerald-500 p-10 shadow-2xl space-y-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-stone-800">インポート完了</h3>
                <p className="text-stone-500 font-bold">バッチID: {importResult.batchId}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                 <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-600 font-black uppercase mb-1">保存成功</div>
                    <div className="text-3xl font-black text-emerald-700">{importResult.successCount} <span className="text-sm">件</span></div>
                 </div>
                 <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                    <div className="text-[10px] text-stone-400 font-black uppercase mb-1">スキップ</div>
                    <div className="text-3xl font-black text-stone-500">{importResult.skippedCount} <span className="text-sm">件</span></div>
                 </div>
                 <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                    <div className="text-[10px] text-red-500 font-black uppercase mb-1">エラー</div>
                    <div className="text-3xl font-black text-red-600">{importResult.failedCount} <span className="text-sm">件</span></div>
                 </div>
              </div>
              <div className="pt-6">
                 <button 
                  onClick={() => { setPreview(null); setMapping({}); setImportResult(null); }}
                  className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black rounded-xl transition-all"
                 >
                  別のファイルを処理する
                 </button>
              </div>
            </section>
          )}

        </div>
      )}

      {/* 改善②：保存前の最終確認ダイアログ */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 text-emerald-600">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-2xl font-black text-stone-800">最終確認</h2>
              </div>

              <div className="space-y-4">
                <p className="font-bold text-stone-600 leading-relaxed">
                  以下の内容でCSV取り込みを実行します
                </p>
                
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-500">新規登録件数</span>
                    <span className="text-lg font-black text-emerald-600">{summary?.newCandidates || 0} 件</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-500">スキップ件数</span>
                    <span className="text-lg font-black text-stone-400">{(summary?.totalRows || 0) - (summary?.newCandidates || 0)} 件</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-stone-400 font-bold">
                      <span>重複候補（保存されません）</span>
                      <span>{summary?.duplicateCandidates || 0} 件</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-stone-400 font-bold">
                      <span>完全一致（保存されません）</span>
                      <span>{summary?.completeMatches || 0} 件</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-xs font-bold">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>既存患者の更新は行われません</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-4 px-6 bg-stone-100 hover:bg-stone-200 text-stone-600 font-black rounded-2xl transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={executeImport}
                  className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  実行する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
