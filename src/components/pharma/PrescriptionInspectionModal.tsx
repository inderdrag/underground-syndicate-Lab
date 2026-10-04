import React, { useState } from 'react';
import { PrescriptionBlankItem, BLANK_DISCREPANCIES, DiscrepancyType } from '../../data/prescription_blanks_config';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Calendar,
  Award
} from 'lucide-react';
import { sounds } from '../../engine/soundEffects';

interface PrescriptionInspectionModalProps {
  blank: PrescriptionBlankItem;
  patientName: string;
  patientAvatar: string;
  onVerifyResult: (passed: boolean, foundDiscrepanciesCount: number) => void;
  onClose: () => void;
}

export const PrescriptionInspectionModal: React.FC<PrescriptionInspectionModalProps> = ({
  blank,
  patientName,
  patientAvatar,
  onVerifyResult,
  onClose
}) => {
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState<DiscrepancyType[]>([]);

  const toggleDiscrepancy = (id: DiscrepancyType) => {
    sounds.playClick();
    if (selectedDiscrepancies.includes(id)) {
      setSelectedDiscrepancies(prev => prev.filter(d => d !== id));
    } else {
      setSelectedDiscrepancies(prev => [...prev, id]);
    }
  };

  const handleFinishInspection = (acceptSale: boolean) => {
    // True discrepancies on the blank
    const actualDiscrepancies = blank.discrepancies || [];
    const correctlyIdentified = selectedDiscrepancies.filter(d => actualDiscrepancies.includes(d)).length;

    if (acceptSale) {
      // If accepted and blank was actually valid
      if (actualDiscrepancies.length === 0) {
        sounds.playOverrideSuccess();
        onVerifyResult(true, 0);
      } else {
        // Accepted a flawed/fraudulent blank!
        sounds.playAlarmBeep();
        onVerifyResult(false, actualDiscrepancies.length);
      }
    } else {
      // Rejected sale
      sounds.playClick();
      onVerifyResult(false, correctlyIdentified);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-blue-500/30 w-full max-w-lg rounded-2xl p-6 text-white space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{patientAvatar}</span>
            <div>
              <h3 className="font-bold text-base text-blue-200">Проверка Бланка: {patientName}</h3>
              <p className="text-xs text-slate-400">Экспертиза оригинальности и срока действия</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* PRESCRIPTION BLANK VISUAL */}
        <div className="bg-[#fefce8] text-slate-900 p-5 rounded-xl border-2 border-amber-300 font-serif space-y-3 relative overflow-hidden shadow-inner">
          <div className="flex justify-between border-b border-slate-300 pb-2 text-[10px] text-slate-600 uppercase font-mono">
            <span>ФОРМА: {blank.series}-{blank.number}</span>
            <span>Срок: {blank.issueDateDay} день</span>
          </div>

          <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-800">
            МИНЗДРАВ // РЕЦЕПТУРНЫЙ БЛАНК
          </div>

          <div className="text-xs space-y-1">
            <div><strong>ЛПУ:</strong> {blank.hospitalName}</div>
            <div><strong>Врач:</strong> {blank.doctorName}</div>
            <div><strong>Пациент:</strong> {blank.patientName}</div>
            <div className="p-2 bg-amber-100 rounded border border-amber-300 my-2 font-mono text-xs">
              <strong>Rp:</strong> {blank.drugName} ({blank.prescribedDoseMg} мг) — {blank.quantityUnits} уп.
            </div>
          </div>

          <div className="flex justify-between items-end pt-2 text-[10px]">
            <div className="border border-red-500/50 p-1 rounded text-red-700 font-bold rotate-[-6deg] text-[9px]">
              [ПЕЧАТЬ ВРАЧА]
            </div>
            <div className="italic">Подпись: ____________</div>
          </div>
        </div>

        {/* DISCREPANCY SELECTION */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Отметьте найденные нарушения (если есть):</label>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.values(BLANK_DISCREPANCIES).map(disc => {
              const isChecked = selectedDiscrepancies.includes(disc.id);
              return (
                <button
                  key={disc.id}
                  onClick={() => toggleDiscrepancy(disc.id)}
                  className={`p-2.5 rounded-lg border text-xs text-left flex items-center justify-between transition-all ${
                    isChecked
                      ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">{disc.titleRu}</div>
                    <div className="text-[10px] text-slate-400">{disc.descriptionRu}</div>
                  </div>
                  {isChecked && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleFinishInspection(false)}
            className="py-3 bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-200 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            ❌ ОТКАЗАТЬ И ОПОВЕСТИТЬ
          </button>
          <button
            onClick={() => handleFinishInspection(true)}
            className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            ✅ ПРИНЯТЬ БЛАНК И ОТПУСТИТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
