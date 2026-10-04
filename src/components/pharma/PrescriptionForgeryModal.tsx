import React, { useState } from 'react';
import { BlankLevel, PHARMA_DRUGS_CATALOG } from '../../data/pharma_recipes_config';
import { PRESCRIPTION_BLANK_FORMS, DOCTOR_PARTNERS, PrescriptionBlankItem } from '../../data/prescription_blanks_config';
import {
  FileText,
  Stamp,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { sounds } from '../../engine/soundEffects';

interface PrescriptionForgeryModalProps {
  inventory: Record<string, number>;
  onForgeCompleted: (newBlank: PrescriptionBlankItem) => void;
  onClose: () => void;
}

export const PrescriptionForgeryModal: React.FC<PrescriptionForgeryModalProps> = ({
  inventory,
  onForgeCompleted,
  onClose
}) => {
  const [selectedLevel, setSelectedLevel] = useState<BlankLevel>('form_107_1u');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(DOCTOR_PARTNERS[0].id);
  const [selectedDrugId, setSelectedDrugId] = useState<string>('gabapentin');
  const [tracingAccuracy, setTracingAccuracy] = useState<number>(50);

  const reqCleanBlankId = selectedLevel === 'form_107_u_np'
    ? 'clean_blank_107_u_np'
    : selectedLevel === 'form_148_1u_88'
    ? 'clean_blank_148_1u_88'
    : 'clean_blank_107_1u';

  const hasBlank = (inventory[reqCleanBlankId] || 0) > 0;
  const hasStamp = (inventory['doctor_stamp_kit'] || 0) > 0;

  const selectedDoctor = DOCTOR_PARTNERS.find(d => d.id === selectedDoctorId) || DOCTOR_PARTNERS[0];
  const selectedDrug = PHARMA_DRUGS_CATALOG.find(d => d.id === selectedDrugId) || PHARMA_DRUGS_CATALOG[0];

  const handleForgeSubmit = () => {
    if (!hasBlank) {
      alert(`Необходим расходник: Чистый бланк (${reqCleanBlankId})`);
      return;
    }

    const isSuccess = tracingAccuracy >= 60;

    if (isSuccess) {
      sounds.playOverrideSuccess();
    } else {
      sounds.playAlarmBeep();
    }

    const forgedBlank: PrescriptionBlankItem = {
      id: `FORGED-${Date.now()}`,
      blankLevel: selectedLevel,
      series: `SER-${Math.floor(100 + Math.random() * 900)}`,
      number: `${Math.floor(100000 + Math.random() * 900000)}`,
      doctorName: selectedDoctor.name,
      hospitalName: selectedDoctor.clinic,
      patientName: 'Анонимный Покупатель',
      drugId: selectedDrug.id,
      drugName: selectedDrug.name,
      prescribedDoseMg: 100,
      quantityUnits: 2,
      issueDateDay: 1,
      isForged: true,
      discrepancies: isSuccess ? [] : ['wrong_signature', 'smudged_stamp'],
      isValid: isSuccess
    };

    onForgeCompleted(forgedBlank);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-amber-500/30 w-full max-w-lg rounded-2xl p-6 text-white space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-base text-amber-200">Мастерская Подделки Бланков</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* FORM LEVEL SELECTION */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Уровень Рецептурного Бланка:</label>
          <div className="grid grid-cols-1 gap-2">
            {['form_107_1u', 'form_148_1u_88', 'form_107_u_np'].map(lvl => {
              const def = PRESCRIPTION_BLANK_FORMS[lvl];
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl as BlankLevel)}
                  className={`p-3 rounded-xl border text-xs text-left transition-all ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">{def.nameRu}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{def.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DOCTOR PARTNER SELECTION */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Врач-Партнёр (Штамп и Клише):</label>
          <select
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}
            className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          >
            {DOCTOR_PARTNERS.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.clinic}) — Доверие: {doc.trustLevel}%
              </option>
            ))}
          </select>
        </div>

        {/* SIGNATURE REPLICATION MINI-GAME */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <label className="text-xs text-slate-300 flex justify-between">
            <span>Точность повторения подписи:</span>
            <span className="font-bold text-amber-400">{tracingAccuracy}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={tracingAccuracy}
            onChange={e => setTracingAccuracy(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* REQUIREMENT CHECK */}
        <div className="flex justify-between text-xs p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className={hasBlank ? 'text-emerald-400' : 'text-red-400'}>
            {hasBlank ? '✓ Чистый бланк есть' : '❌ Нет чистого бланка'}
          </span>
          <span className={hasStamp ? 'text-emerald-400' : 'text-amber-400'}>
            {hasStamp ? '✓ Набор штампов' : '⚠️ Без штампа (+риск)'}
          </span>
        </div>

        <button
          onClick={handleForgeSubmit}
          className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm rounded-xl shadow-xl transition-all active:scale-95"
        >
          ✍️ ИЗГОТОВИТЬ ПОДДЕЛЬНЫЙ БЛАНК
        </button>
      </div>
    </div>
  );
};
