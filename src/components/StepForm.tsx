export default function StepForm({ stakeholderId, stepId }: { stakeholderId: string; stepId: number }) {
  const inputClass = "w-full px-4 py-3 bg-surface border border-outline-variant/20 rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm";
  const labelClass = "block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5";
  const fileClass = "block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:font-semibold file:bg-[#FF5A30]/10 file:text-[#FF5A30] hover:file:bg-[#FF5A30]/20 transition-all cursor-pointer";

  if (stakeholderId === "promoter") {
    if (stepId === 1) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Company Name</label><input type="text" className={inputClass} placeholder="e.g. Live Nation Africa" required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Primary Markets</label><input type="text" className={inputClass} placeholder="e.g. Lagos, Accra" required /></div>
          <div><label className={labelClass}>Expected Tour Budget</label><input type="text" className={inputClass} placeholder="e.g. $50,000" required /></div>
        </div>
      </div>
    );
    if (stepId === 2) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Upload Prior Certifications (Optional)</label><input type="file" className={fileClass} /></div>
      </div>
    );
    if (stepId === 3) return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Director BVN / NIN</label><input type="text" className={inputClass} placeholder="11-digit BVN" required /></div>
          <div><label className={labelClass}>Company Registration No (RC)</label><input type="text" className={inputClass} placeholder="e.g. RC 1234567" required /></div>
        </div>
      </div>
    );
    if (stepId === 4) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Coverage Start Date</label><input type="date" className={inputClass} required /></div>
        <label className="flex items-start gap-3 mt-4">
          <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
          <span className="text-sm text-on-surface-variant">I agree to the SanlamAllianz terms of service and authorize automatic premium deduction from my enterprise account.</span>
        </label>
      </div>
    );
    if (stepId === 5) return (
      <div className="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
          <span className="text-sm text-on-surface-variant">I acknowledge that Tour Finance facilities are unlocked and agree to submit event budgets for underwriting.</span>
        </label>
      </div>
    );
  }

  if (stakeholderId === "workforce") {
    if (stepId === 1) return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Primary Role</label><select className={inputClass} required><option value="">Select Role</option><option value="sound">Sound Engineer</option><option value="light">Lighting Tech</option><option value="stage">Stage Manager</option></select></div>
          <div><label className={labelClass}>Years of Experience</label><input type="number" className={inputClass} placeholder="e.g. 5" required /></div>
        </div>
      </div>
    );
    if (stepId === 2) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Upload Government ID</label><input type="file" className={fileClass} required /></div>
        <div><label className={labelClass}>Reference Email</label><input type="email" className={inputClass} placeholder="reference@example.com" required /></div>
      </div>
    );
    if (stepId === 3) return (
      <div className="space-y-4 mb-8">
        <p className="text-sm text-on-surface-variant italic">Role-Specific Training required for this step.</p>
      </div>
    );
    if (stepId === 4) return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Next of Kin Name</label><input type="text" className={inputClass} placeholder="Full Name" required /></div>
          <div><label className={labelClass}>Next of Kin Phone</label><input type="text" className={inputClass} placeholder="Phone Number" required /></div>
        </div>
      </div>
    );
    if (stepId === 5) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Passport Number</label><input type="text" className={inputClass} placeholder="For cross-border deployment" required /></div>
        <div><label className={labelClass}>Preferred Currency for Payroll</label><select className={inputClass} required><option value="">Select Currency</option><option value="USD">USD</option><option value="NGN">NGN</option><option value="ZAR">ZAR</option><option value="KES">KES</option></select></div>
      </div>
    );
  }

  if (stakeholderId === "vendor") {
    if (stepId === 1) return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Business Category</label><select className={inputClass} required><option value="">Select Category</option><option value="equipment">Equipment Supply</option><option value="logistics">Logistics</option><option value="catering">Catering</option></select></div>
          <div><label className={labelClass}>Capacity / Fleet Size</label><input type="text" className={inputClass} placeholder="e.g. 3 Trucks" required /></div>
        </div>
      </div>
    );
    if (stepId === 2) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Upload CAC / Business Registration</label><input type="file" className={fileClass} required /></div>
        <div><label className={labelClass}>Tax Clearance Certificate</label><input type="file" className={fileClass} required /></div>
      </div>
    );
    if (stepId === 3) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Public Profile Description</label><textarea className={inputClass} rows={3} placeholder="Describe your services..." required></textarea></div>
        <div><label className={labelClass}>Upload Logo</label><input type="file" className={fileClass} required /></div>
      </div>
    );
    if (stepId === 4) return (
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Estimated Equipment Value ($)</label><input type="number" className={inputClass} placeholder="e.g. 150000" required /></div>
          <div><label className={labelClass}>Primary Storage Location</label><input type="text" className={inputClass} placeholder="City, Country" required /></div>
        </div>
      </div>
    );
    if (stepId === 5) return (
      <div className="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
          <span className="text-sm text-on-surface-variant">I acknowledge Working Capital Access is unlocked.</span>
        </label>
      </div>
    );
  }

  if (stakeholderId === "talent") {
    if (stepId === 1) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Agency Name</label><input type="text" className={inputClass} placeholder="e.g. Star Management" required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Artists on Roster</label><input type="number" className={inputClass} placeholder="e.g. 5" required /></div>
          <div><label className={labelClass}>Territory Preferences</label><input type="text" className={inputClass} placeholder="e.g. West Africa, EU" required /></div>
        </div>
      </div>
    );
    if (stepId === 2) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Artist Name</label><input type="text" className={inputClass} placeholder="Select Artist..." required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Upload Technical Rider</label><input type="file" className={fileClass} required /></div>
          <div><label className={labelClass}>Upload Fee Schedule</label><input type="file" className={fileClass} required /></div>
        </div>
      </div>
    );
    if (stepId === 3) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Proposed Block Rate ($)</label><input type="text" className={inputClass} placeholder="e.g. $10,000 per stop" required /></div>
        <label className="flex items-start gap-3 mt-4">
          <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
          <span className="text-sm text-on-surface-variant">I accept the Ckrowd standard terms for performance contracts.</span>
        </label>
      </div>
    );
    if (stepId === 4) return (
      <div className="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 w-4 h-4 text-[#FF5A30] border-outline-variant/30 rounded focus:ring-[#FF5A30]" required />
          <span className="text-sm text-on-surface-variant">I acknowledge the non-appearance terms embedded in my contract.</span>
        </label>
      </div>
    );
    if (stepId === 5) return (
      <div className="space-y-4 mb-8">
        <div><label className={labelClass}>Agency Bank Name</label><input type="text" className={inputClass} placeholder="e.g. Access Bank" required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Account Number</label><input type="text" className={inputClass} placeholder="10 digits" required /></div>
          <div><label className={labelClass}>Routing/Sort Code</label><input type="text" className={inputClass} placeholder="Sort Code" required /></div>
        </div>
      </div>
    );
  }

  return null;
}
