/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useBroker } from '../context/BrokerContext';
import { validateNationalCode, formatCardNumber } from '../utils/iranianBanks';
import {
  X,
  ShieldCheck,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileText,
  Mail,
  Phone,
  CreditCard,
  Building2,
  BadgeCheck,
} from 'lucide-react';

export const KycModal: React.FC = () => {
  const { isKycModalOpen, setKycModalOpen, kycInfo, submitKyc } = useBroker();

  const [fullName, setFullName] = useState(kycInfo.fullName || '');
  const [nationalCode, setNationalCode] = useState(kycInfo.nationalCode || '');
  const [phoneNumber, setPhoneNumber] = useState(kycInfo.phoneNumber || '');
  const [email, setEmail] = useState(kycInfo.email || 'user@example.com');
  const [birthDate, setBirthDate] = useState(kycInfo.birthDate || '1372/06/15');
  const [documentType, setDocumentType] = useState<'national_card' | 'driving_license' | 'passport'>(
    kycInfo.documentType || 'national_card'
  );
  const [cardNumber, setCardNumber] = useState(kycInfo.cardNumber || '6219861043928154');
  const [sheba, setSheba] = useState(kycInfo.sheba || 'IR450560084380001234567890');
  const [idCardImage, setIdCardImage] = useState<string | undefined>(kycInfo.idCardImage);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isKycModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('فقط فایل‌های تصویری (JPG, PNG, WEBP) قابل قبول هستند.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIdCardImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('فقط فایل‌های تصویری قابل قبول هستند.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIdCardImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('نام و نام خانوادگی را وارد نمایید.');
      return;
    }

    if (!validateNationalCode(nationalCode)) {
      setError('کد ملی ۱۰ رقمی وارد شده نامعتبر است (رقم کنترل تطابق ندارد).');
      return;
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      setError('شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('آدرس ایمیل معتبر وارد فرمایید.');
      return;
    }

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length !== 16) {
      setError('شماره کارت بانکی باید ۱۶ رقم باشد.');
      return;
    }

    if (!sheba.toUpperCase().startsWith('IR') || sheba.replace(/\s+/g, '').length < 26) {
      setError('شماره شبا باید با IR شروع شده و ۲۶ کاراکتر کامل باشد.');
      return;
    }

    submitKyc({
      fullName,
      nationalCode,
      phoneNumber,
      email,
      birthDate,
      cardNumber: cleanCard,
      sheba: sheba.toUpperCase().replace(/\s+/g, ''),
      documentType,
      idCardImage: idCardImage || '/sample-id-preview.png',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setKycModalOpen(false);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xl bg-[#0e131b] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>احراز هویت جامع و هوشمند (KYC)</span>
                {kycInfo.isVerified ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    <span>تایید شده (سطح ۲)</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    نیازمند تکمیل مدارک
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبیق کد ملی با شماره همراه، شبا و تصویر کارت شناسایی جهت امنیت سرمایه شما
              </p>
            </div>
          </div>
          <button
            onClick={() => setKycModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          {savedSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h4 className="font-bold text-slate-100 text-base">
                مدارک هویتی و تصویر کارت شناسایی با موفقیت دریافت و تایید شد
              </h4>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                حساب شما در وضعیت سطح ۲ قرار گرفت. تمامی قابلیت‌های واریز شتابی کارت به کارت، شارژ رمزارز و تسویه پایا برای شما فعال است.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نام و نام خانوادگی کامل:</label>
                  <input
                    type="text"
                    value={fullName}
                    placeholder="مثال: حسین پاکزاد"
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#080b10] border border-slate-800 rounded-xl py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">کد ملی ۱۰ رقمی:</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={nationalCode}
                    placeholder="۰۰۲۱۴۵۸۹۶۳"
                    onChange={(e) => setNationalCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#080b10] border border-slate-800 rounded-xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>شماره همراه (به نام متقاضی):</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={phoneNumber}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#080b10] border border-slate-800 rounded-xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>آدرس ایمیل:</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    placeholder="user@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#080b10] border border-slate-800 rounded-xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Document Type Selector */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">نوع مدرک شناسایی جهت بارگذاری:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'national_card', label: 'کارت ملی هوشمند' },
                    { id: 'driving_license', label: 'گواهینامه رانندگی' },
                    { id: 'passport', label: 'گذرنامه معتبر' },
                  ].map((doc) => (
                    <button
                      type="button"
                      key={doc.id}
                      onClick={() => setDocumentType(doc.id as any)}
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-colors ${
                        documentType === doc.id
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                          : 'border-slate-800 bg-[#090d13] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Card & Sheba */}
              <div className="space-y-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                    <span>شماره ۱۶ رقمی کارت بانکی شتاب:</span>
                  </label>
                  <input
                    type="text"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="۶۲۱۹-۸۶۱۰-۴۳۹۲-۸۱۵۴"
                    className="w-full bg-[#080b10] border border-slate-800 rounded-xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>شماره شبا (IBAN با پیشوند IR):</span>
                  </label>
                  <input
                    type="text"
                    value={sheba}
                    onChange={(e) => setSheba(e.target.value)}
                    placeholder="IR450560084380001234567890"
                    className="w-full bg-[#080b10] border border-slate-800 rounded-xl py-2 px-3 text-slate-100 font-mono-numbers text-xs text-left focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Document Image Upload Box */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>بارگذاری و تحویل تصویر مدرک شناسایی:</span>
                  <span className="text-[10px] text-indigo-400 font-normal">فرمت‌های JPG، PNG (حداکثر ۵ مگابایت)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {idCardImage ? (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={idCardImage}
                        alt="پیش‌نمایش مدرک"
                        className="w-20 h-14 object-cover rounded-lg border border-slate-700 bg-slate-900"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">
                          تصویر {documentType === 'national_card' ? 'کارت ملی' : documentType === 'driving_license' ? 'گواهینامه' : 'گذرنامه'}
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>تصویر بارگذاری شده و آماده است</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      >
                        تغییر عکس
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdCardImage(undefined)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer p-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-2 ${
                      isDragging
                        ? 'border-indigo-400 bg-indigo-500/10'
                        : 'border-slate-800 bg-[#080b10] hover:border-slate-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-200">
                        کلیک کنید یا تصویر کارت را به اینجا بکشید
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        کارت ملی هوشمند، گواهینامه رانندگی یا صفحه اول گذرنامه
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
              >
                ثبت، بارگذاری و تایید هویت
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
