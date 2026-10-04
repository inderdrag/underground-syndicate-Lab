/**
 * Configuration for Prescription Blanks (Рецептурные Бланки), Inspection Discrepancies, and Forgery System.
 */

import { BlankLevel } from './pharma_recipes_config';

export interface PrescriptionBlankFormDef {
  id: BlankLevel;
  nameRu: string;
  code: string;
  description: string;
  validityDays: number;
  watermarkProtected: boolean;
  refillAllowed: boolean;
  baseBribeCost: number;
  unauthorizedSaleStingRisk: number; // Sting chance when sold without blank (0-1)
  districtPriceBoost: number;
}

export const PRESCRIPTION_BLANK_FORMS: Record<string, PrescriptionBlankFormDef> = {
  none: {
    id: 'none',
    nameRu: 'Безрецептурный (A)',
    code: 'OTC',
    description: 'Для товаров первой необходимости. Рецепт не требуется.',
    validityDays: 365,
    watermarkProtected: false,
    refillAllowed: true,
    baseBribeCost: 0,
    unauthorizedSaleStingRisk: 0.02,
    districtPriceBoost: 1.0
  },
  form_107_1u: {
    id: 'form_107_1u',
    nameRu: 'Бланк 107-1/у (Rx / Schedule V)',
    code: '107-1/у',
    description: 'Рецепт на стандартные фарм-препараты (Габапентин, Лирика, Золофт, Трамадол, Прозак). Срок 60 дней.',
    validityDays: 60,
    watermarkProtected: false,
    refillAllowed: true,
    baseBribeCost: 80,
    unauthorizedSaleStingRisk: 0.15,
    districtPriceBoost: 1.3
  },
  form_148_1u_88: {
    id: 'form_148_1u_88',
    nameRu: 'Бланк 148-1/у-88 (Особый Учёт / Schedule IV-II)',
    code: '148-1/у-88',
    description: 'Особый учёт для транквилизаторов и психостимуляторов (Золпидем, Ксанакс, Модафинил, Риталин, Кодеин). Срок 15 дней.',
    validityDays: 15,
    watermarkProtected: true,
    refillAllowed: false,
    baseBribeCost: 200,
    unauthorizedSaleStingRisk: 0.28,
    districtPriceBoost: 1.6
  },
  form_107_u_np: {
    id: 'form_107_u_np',
    nameRu: 'Спецбланк 107/у-НП (Элитный / Schedule II)',
    code: '107/у-НП',
    description: 'Номерной спецбланк с защитной розовой сеткой на наркотические анальгетики (Аддерол, Оксикодон, Морфин, Фентанил). Срок 15 дней, без повторов.',
    validityDays: 15,
    watermarkProtected: true,
    refillAllowed: false,
    baseBribeCost: 500,
    unauthorizedSaleStingRisk: 0.45,
    districtPriceBoost: 2.2
  }
};

export type DiscrepancyType =
  | 'expired_date'
  | 'smudged_stamp'
  | 'wrong_signature'
  | 'invalid_series'
  | 'excessive_dosage';

export interface DiscrepancyDef {
  id: DiscrepancyType;
  titleRu: string;
  descriptionRu: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suspicionPenalty: number;
}

export const BLANK_DISCREPANCIES: Record<DiscrepancyType, DiscrepancyDef> = {
  expired_date: {
    id: 'expired_date',
    titleRu: 'Просроченная дата выдачи',
    descriptionRu: 'Дата выписки рецепта превышает допустимый срок действия бланка.',
    severity: 'medium',
    suspicionPenalty: 15
  },
  smudged_stamp: {
    id: 'smudged_stamp',
    titleRu: 'Размазанная или поддельная печать',
    descriptionRu: 'Печать лечебного учреждения не читаема или напечатана струйным принтером.',
    severity: 'medium',
    suspicionPenalty: 20
  },
  wrong_signature: {
    id: 'wrong_signature',
    titleRu: 'Несоответствие подписи врача',
    descriptionRu: 'Подпись на бланке отличается от факсимиле зарегистрированного специалиста.',
    severity: 'high',
    suspicionPenalty: 30
  },
  invalid_series: {
    id: 'invalid_series',
    titleRu: 'Номер не из официальной серии',
    descriptionRu: 'Серийный номер бланка отсутствует в государственном реестре ФСН.',
    severity: 'high',
    suspicionPenalty: 35
  },
  excessive_dosage: {
    id: 'excessive_dosage',
    titleRu: 'Превышение разовой нормативы дозы',
    descriptionRu: 'Указанное количество препарата превышает высший разовый предел Минздрава.',
    severity: 'critical',
    suspicionPenalty: 50
  }
};

export interface PrescriptionBlankItem {
  id: string;
  blankLevel: BlankLevel;
  series: string;
  number: string;
  doctorName: string;
  hospitalName: string;
  patientName: string;
  drugId: string;
  drugName: string;
  prescribedDoseMg: number;
  quantityUnits: number;
  issueDateDay: number;
  isForged: boolean;
  discrepancies: DiscrepancyType[];
  isValid: boolean;
}

export const DOCTOR_PARTNERS = [
  { id: 'doc_petrov', name: 'Д-р Петров В.С.', clinic: 'Городская поликлиника №4', trustLevel: 80, bribeDiscount: 0.1, riskPercent: 8 },
  { id: 'doc_sidorova', name: 'Д-р Сидорова М.А.', clinic: 'Частный Неврологический Центр', trustLevel: 95, bribeDiscount: 0.2, riskPercent: 4 },
  { id: 'doc_volkov', name: 'Д-р Волков К.Е.', clinic: 'Скорая Помощь №12', trustLevel: 60, bribeDiscount: 0.0, riskPercent: 18 }
];
