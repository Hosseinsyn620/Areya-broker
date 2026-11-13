/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BankAccountInfo } from '../types/broker';

export interface BankMetadata {
  name: string;
  code: string;
  color: string;
  bgLight: string;
}

export const IRANIAN_BANKS_MAP: Record<string, BankMetadata> = {
  '603769': { name: 'بانک صادرات ایران', code: 'BSI', color: '#1e3a8a', bgLight: '#eff6ff' },
  '603799': { name: 'بانک ملی ایران', code: 'BMI', color: '#1a56db', bgLight: '#ebf5ff' },
  '610433': { name: 'بانک ملت', code: 'BML', color: '#b91c1c', bgLight: '#fef2f2' },
  '621986': { name: 'بانک سامان', code: 'BSM', color: '#047857', bgLight: '#ecfdf5' },
  '622106': { name: 'بانک پارسیان', code: 'BPA', color: '#b45309', bgLight: '#fffbeb' },
  '502229': { name: 'بانک پاسارگاد', code: 'BPG', color: '#d97706', bgLight: '#fffbeb' },
  '636214': { name: 'بانک آینده', code: 'BAY', color: '#7c3aed', bgLight: '#f5f3ff' },
  '627412': { name: 'بانک اقتصاد نوین', code: 'BEN', color: '#4338ca', bgLight: '#eef2ff' },
  '627353': { name: 'بانک تجارت', code: 'BTE', color: '#0369a1', bgLight: '#f0f9ff' },
  '589210': { name: 'بانک سپه', code: 'BSP', color: '#ea580c', bgLight: '#fff7ed' },
  '589463': { name: 'بانک رفاه کارگران', code: 'BRF', color: '#0d9488', bgLight: '#f0fdfa' },
  '603770': { name: 'بانک کشاورزی', code: 'BKS', color: '#15803d', bgLight: '#f0fdf4' },
  '504706': { name: 'بانک شهر', code: 'BSH', color: '#be123c', bgLight: '#fff1f2' },
  '505416': { name: 'بانک گردشگری', code: 'BGR', color: '#9333ea', bgLight: '#faf5ff' },
  '606373': { name: 'بانک مهر ایران', code: 'BMIQ', color: '#059669', bgLight: '#ecfdf5' },
  '502908': { name: 'بانک توسعه تعاون', code: 'BTT', color: '#0284c7', bgLight: '#f0f9ff' },
  '639346': { name: 'بانک سینا', code: 'BSN', color: '#c026d3', bgLight: '#fdf4ff' },
  '606256': { name: 'بانک قرض‌الحسنه رسالت', code: 'BQR', color: '#0891b2', bgLight: '#ecfeff' },
  '505785': { name: 'بانک ایران زمین', code: 'BIZ', color: '#e11d48', bgLight: '#fff1f2' },
};

/**
 * Identify Iranian bank from 16-digit card number
 */
export function getBankFromCardNumber(cardNumber: string): BankMetadata {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length >= 6) {
    const bin = clean.substring(0, 6);
    if (IRANIAN_BANKS_MAP[bin]) {
      return IRANIAN_BANKS_MAP[bin];
    }
  }
  return {
    name: 'شبکه بانکی شتاب',
    code: 'SHETAB',
    color: '#64748b',
    bgLight: '#f8fafc',
  };
}

/**
 * Format 16 digit card number into 4 groups separated by space or dash
 */
export function formatCardNumber(card: string): string {
  const digits = card.replace(/\D/g, '').substring(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 - ');
}

/**
 * Format Iranian Sheba (IBAN): IRxx xxxx xxxx xxxx xxxx xxxx xx
 */
export function formatSheba(sheba: string): string {
  const clean = sheba.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const digits = clean.startsWith('IR') ? clean.substring(2) : clean;
  const chunks = digits.match(/.{1,4}/g) || [];
  return `IR - ${chunks.join(' - ')}`;
}

/**
 * Validate Iranian National ID (کد ملی ۱۰ رقمی با رقم کنترل)
 */
export function validateNationalCode(code: string): boolean {
  if (!code || code.length !== 10) return false;
  if (!/^\d{10}$/.test(code)) return false;

  // Check repeating digits like 1111111111, 2222222222
  if (/^(\d)\1{9}$/.test(code)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(code.charAt(i), 10) * (10 - i);
  }

  const remainder = sum % 11;
  const checkDigit = parseInt(code.charAt(9), 10);

  if (remainder < 2) {
    return checkDigit === remainder;
  } else {
    return checkDigit === 11 - remainder;
  }
}

/**
 * Format currency numbers with commas (e.g. 1,250,000)
 */
export function formatCurrency(num: number, decimals = 0): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  const parts = num.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Convert Persian numbers to English and vice-versa
 */
export function toPersianDigits(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

/**
 * Convert number to Persian words (عدد به حروف فارسی)
 * e.g. 5000000 -> پنج میلیون تومان
 */
const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const teens = [
  'ده',
  'یازده',
  'دوازده',
  'سیزده',
  'چهارده',
  'پانزده',
  'شانزده',
  'هفده',
  'هجده',
  'نوزده',
];
const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const hundreds = [
  '',
  'یکصد',
  'دویست',
  'سیصد',
  'چهارصد',
  'پانصد',
  'ششصد',
  'هفتصد',
  'هشتصد',
  'نهصد',
];
const scales = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

function convertChunk(num: number): string {
  const result: string[] = [];
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;

  if (h > 0) result.push(hundreds[h]);

  if (t === 1) {
    result.push(teens[o]);
  } else {
    if (t > 1) result.push(tens[t]);
    if (o > 0) result.push(ones[o]);
  }

  return result.join(' و ');
}

export function numberToWordsFa(num: number): string {
  if (num === 0) return 'صفر تومان';
  if (num < 0) return 'منفی ' + numberToWordsFa(Math.abs(num));

  const chunks: number[] = [];
  let temp = Math.floor(num);

  while (temp > 0) {
    chunks.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  const resultWords: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (chunk > 0) {
      const chunkWord = convertChunk(chunk);
      const scaleWord = scales[i];
      resultWords.push(scaleWord ? `${chunkWord} ${scaleWord}` : chunkWord);
    }
  }

  return resultWords.join(' و ') + ' تومان';
}

/**
 * Official verified Iranian brokerage bank accounts for Card-to-Card deposits
 */
export const OFFICIAL_BROKER_BANK_ACCOUNTS: BankAccountInfo[] = [
  {
    id: 'bank_acc_1',
    bankName: 'بانک صادرات ایران',
    bankCode: 'BSI',
    cardPrefix: '603769',
    accountHolder: 'حسین پاکزاد کرباسدهی',
    cardNumber: '6037698112541755',
    sheba: 'IR880190000000334719437007',
    accountNumber: '0334719437007',
    dailyLimit: 'کارت به کارت تا ۱۰ میلیون تومان / پایا تا ۱۰۰ میلیون',
    active: true,
  },
  {
    id: 'bank_acc_2',
    bankName: 'بانک سامان',
    bankCode: 'BSM',
    cardPrefix: '621986',
    accountHolder: 'حسین پاکزاد کرباسدهی (حساب امانی بروکر)',
    cardNumber: '6219861043928154',
    sheba: 'IR450560084380001234567890',
    accountNumber: '843-800-1234567-1',
    dailyLimit: 'تا ۱۰ میلیون کارت به کارت / تا ۱۰۰ میلیون پایا',
    active: true,
  },
  {
    id: 'bank_acc_3',
    bankName: 'بانک ملت',
    bankCode: 'BML',
    cardPrefix: '610433',
    accountHolder: 'حسین پاکزاد کرباسدهی (تسویه هوشمند شتاب)',
    cardNumber: '6104337890124563',
    sheba: 'IR780120000000009876543210',
    accountNumber: '4790876543',
    dailyLimit: 'کارت به کارت شتابی آنی',
    active: true,
  },
];
