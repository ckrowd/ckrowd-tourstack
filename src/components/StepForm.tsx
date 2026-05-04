import { useTranslations } from 'next-intl';

export default function StepForm({ stakeholderId, stepId }: { stakeholderId: string; stepId: number }) {
  const t = useTranslations('StepForm');

  const inputClass = "w-full px-4 py-3 bg-surface border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm";
  const labelClass = "block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5";
  const fileClass = "block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-[#FF5A30]/10 file:text-[#FF5A30] hover:file:bg-[#FF5A30]/20 transition-all cursor-pointer";


  const renderStep = () => {
    if (stakeholderId === "promoter") {
      if (stepId === 1) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('promoter.step1.companyName')}</label><input type="text" className={inputClass} placeholder={t('promoter.step1.companyNamePlaceholder')} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('promoter.step1.primaryMarkets')}</label><input type="text" className={inputClass} placeholder={t('promoter.step1.primaryMarketsPlaceholder')} required /></div>
            <div><label className={labelClass}>{t('promoter.step1.expectedBudget')}</label><input type="text" className={inputClass} placeholder={t('promoter.step1.expectedBudgetPlaceholder')} required /></div>
          </div>
        </div>
      );
      if (stepId === 2) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('promoter.step2.certifications')}</label><input type="file" className={fileClass} /></div>
        </div>
      );
      if (stepId === 3) return (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('promoter.step3.directorBvn')}</label><input type="text" className={inputClass} placeholder={t('promoter.step3.directorBvnPlaceholder')} required /></div>
            <div><label className={labelClass}>{t('promoter.step3.rcNumber')}</label><input type="text" className={inputClass} placeholder={t('promoter.step3.rcNumberPlaceholder')} required /></div>
          </div>
        </div>
      );
      if (stepId === 4) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('promoter.step4.startDate')}</label><input type="date" className={inputClass} required /></div>
          <label className="flex items-start gap-3 mt-4">
            <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
            <span className="text-sm text-on-surface-variant">{t('promoter.step4.terms')}</span>
          </label>
        </div>
      );
      if (stepId === 5) return (
        <div className="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
            <span className="text-sm text-on-surface-variant">{t('promoter.step5.acknowledgement')}</span>
          </label>
        </div>
      );
    }

    if (stakeholderId === "workforce") {
      if (stepId === 1) return (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('workforce.step1.role')}</label><select className={inputClass} required><option value="">{t('workforce.step1.roleSelect')}</option><option value="sound">{t('roles.sound')}</option><option value="light">{t('roles.light')}</option><option value="stage">{t('roles.stage')}</option></select></div>
            <div><label className={labelClass}>{t('workforce.step1.experience')}</label><input type="number" className={inputClass} placeholder={t('workforce.step1.experiencePlaceholder')} required /></div>
          </div>
        </div>
      );
      if (stepId === 2) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('workforce.step2.id')}</label><input type="file" className={fileClass} required /></div>
          <div><label className={labelClass}>{t('workforce.step2.referenceEmail')}</label><input type="email" className={inputClass} placeholder={t('workforce.step2.referenceEmailPlaceholder')} required /></div>
        </div>
      );
      if (stepId === 3) return (
        <div className="space-y-4 mb-8">
          <p className="text-sm text-on-surface-variant italic">{t('workforce.step3.training')}</p>
        </div>
      );
      if (stepId === 4) return (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('workforce.step4.kinName')}</label><input type="text" className={inputClass} placeholder={t('workforce.step4.kinNamePlaceholder')} required /></div>
            <div><label className={labelClass}>{t('workforce.step4.kinPhone')}</label><input type="text" className={inputClass} placeholder={t('workforce.step4.kinPhonePlaceholder')} required /></div>
          </div>
        </div>
      );
      if (stepId === 5) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('workforce.step5.passport')}</label><input type="text" className={inputClass} placeholder={t('workforce.step5.passportPlaceholder')} required /></div>
          <div><label className={labelClass}>{t('workforce.step5.currency')}</label><select className={inputClass} required><option value="">{t('workforce.step5.currencySelect')}</option><option value="USD">USD</option><option value="NGN">NGN</option><option value="ZAR">ZAR</option><option value="KES">KES</option></select></div>
        </div>
      );
    }

    if (stakeholderId === "vendor") {
      if (stepId === 1) return (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('vendor.step1.category')}</label><select className={inputClass} required><option value="">{t('vendor.step1.categorySelect')}</option><option value="equipment">{t('categories.equipment')}</option><option value="logistics">{t('categories.logistics')}</option><option value="catering">{t('categories.catering')}</option></select></div>
            <div><label className={labelClass}>{t('vendor.step1.capacity')}</label><input type="text" className={inputClass} placeholder={t('vendor.step1.capacityPlaceholder')} required /></div>
          </div>
        </div>
      );
      if (stepId === 2) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('vendor.step2.registration')}</label><input type="file" className={fileClass} required /></div>
          <div><label className={labelClass}>{t('vendor.step2.tax')}</label><input type="file" className={fileClass} required /></div>
        </div>
      );
      if (stepId === 3) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('vendor.step3.bio')}</label><textarea className={inputClass} rows={3} placeholder={t('vendor.step3.bioPlaceholder')} required></textarea></div>
          <div><label className={labelClass}>{t('vendor.step3.logo')}</label><input type="file" className={fileClass} required /></div>
        </div>
      );
      if (stepId === 4) return (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('vendor.step4.value')}</label><input type="number" className={inputClass} placeholder={t('vendor.step4.valuePlaceholder')} required /></div>
            <div><label className={labelClass}>{t('vendor.step4.storage')}</label><input type="text" className={inputClass} placeholder={t('vendor.step4.storagePlaceholder')} required /></div>
          </div>
        </div>
      );
      if (stepId === 5) return (
        <div className="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
            <span className="text-sm text-on-surface-variant">{t('vendor.step5.acknowledgement')}</span>
          </label>
        </div>
      );
    }

    if (stakeholderId === "talent") {
      if (stepId === 1) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('talent.step1.agency')}</label><input type="text" className={inputClass} placeholder={t('talent.step1.agencyPlaceholder')} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('talent.step1.roster')}</label><input type="number" className={inputClass} placeholder={t('talent.step1.rosterPlaceholder')} required /></div>
            <div><label className={labelClass}>{t('talent.step1.territory')}</label><input type="text" className={inputClass} placeholder={t('talent.step1.territoryPlaceholder')} required /></div>
          </div>
        </div>
      );
      if (stepId === 2) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('talent.step2.artist')}</label><input type="text" className={inputClass} placeholder={t('talent.step2.artistPlaceholder')} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('talent.step2.rider')}</label><input type="file" className={fileClass} required /></div>
            <div><label className={labelClass}>{t('talent.step2.feeSchedule')}</label><input type="file" className={fileClass} required /></div>
          </div>
        </div>
      );
      if (stepId === 3) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('talent.step3.rate')}</label><input type="text" className={inputClass} placeholder={t('talent.step3.ratePlaceholder')} required /></div>
          <label className="flex items-start gap-3 mt-4">
            <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
            <span className="text-sm text-on-surface-variant">{t('talent.step3.terms')}</span>
          </label>
        </div>
      );
      if (stepId === 4) return (
        <div className="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
            <span className="text-sm text-on-surface-variant">{t('talent.step4.terms')}</span>
          </label>
        </div>
      );
      if (stepId === 5) return (
        <div className="space-y-4 mb-8">
          <div><label className={labelClass}>{t('talent.step5.bankName')}</label><input type="text" className={inputClass} placeholder={t('talent.step5.bankNamePlaceholder')} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>{t('talent.step5.accountNumber')}</label><input type="text" className={inputClass} placeholder={t('talent.step5.accountNumberPlaceholder')} required /></div>
            <div><label className={labelClass}>{t('talent.step5.routingCode')}</label><input type="text" className={inputClass} placeholder={t('talent.step5.routingCodePlaceholder')} required /></div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      onInvalidCapture={(e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (target.validity.valueMissing) {
          target.setCustomValidity(t('validation.required'));
        }
      }}
      onChangeCapture={(e) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        target.setCustomValidity('');
      }}
    >
      {renderStep()}
    </div>
  );
}
