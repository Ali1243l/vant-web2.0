import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Check,
  ExternalLink,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";
import { useSiteControls } from "../../context/SiteControlsContext";

interface AdminWhatsAppManagerProps {
  isAr: boolean;
}

export const AdminWhatsAppManager: React.FC<AdminWhatsAppManagerProps> = ({ isAr }) => {
  const { controls, updateControl } = useSiteControls();

  const WHATSAPP_NUMBERS_KEY = 'vant_custom_whatsapp_numbers_list_v1';
  const [whatsappNumbers, setWhatsappNumbers] = useState<Array<{ id: string; number: string; label: string; isActive: boolean }>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(WHATSAPP_NUMBERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    const activeNum = controls['cfg_whatsapp_phone']?.actionValue || '9647000000000';
    return [
      {
        id: '1',
        number: activeNum,
        label: isAr ? 'رقم المبيعات والطلبات الرئيسي' : 'Primary Sales WhatsApp',
        isActive: true,
      },
    ];
  });

  const activePhoneEntry = whatsappNumbers.find((n) => n.isActive) || whatsappNumbers[0];
  const [primaryPhoneInput, setPrimaryPhoneInput] = useState<string>(() => activePhoneEntry?.number || '9647000000000');
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingPhoneInput, setEditingPhoneInput] = useState('');
  const [editingPhoneLabel, setEditingPhoneLabel] = useState('');
  const [phoneSaveSuccess, setPhoneSaveSuccess] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  // Keep primaryPhoneInput in sync when active phone changes externally
  useEffect(() => {
    if (activePhoneEntry && !editingPhoneId) {
      setPrimaryPhoneInput(activePhoneEntry.number);
    }
  }, [activePhoneEntry?.number]);

  const handleSavePrimaryPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNum = primaryPhoneInput.replace(/[^0-9+]/g, '').trim();
    if (!cleanNum) return;

    setWhatsappNumbers((prev) => {
      let updated: Array<{ id: string; number: string; label: string; isActive: boolean }>;
      const activeIndex = prev.findIndex((item) => item.isActive);
      if (activeIndex !== -1) {
        updated = prev.map((item, idx) => ({
          ...item,
          number: idx === activeIndex ? cleanNum : item.number,
        }));
      } else if (prev.length > 0) {
        updated = prev.map((item, idx) => ({
          ...item,
          isActive: idx === 0,
          number: idx === 0 ? cleanNum : item.number,
        }));
      } else {
        updated = [
          {
            id: '1',
            number: cleanNum,
            label: isAr ? 'الرقم الأساسي المعتمد' : 'Primary Adopted Line',
            isActive: true,
          },
        ];
      }

      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}

      updateControl('cfg_whatsapp_phone', { actionValue: cleanNum });
      updateControl('cfg_bespoke_phone', { actionValue: cleanNum });

      setSavedSuccessMsg(isAr ? `تم حفظ واعتماد الرقم (${cleanNum}) بنجاح للمتجر` : `Number (${cleanNum}) saved & adopted successfully`);
      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3500);

      return updated;
    });
  };

  const handleSetActivePhone = (id: string) => {
    setWhatsappNumbers((prev) => {
      const updated = prev.map((item) => ({
        ...item,
        isActive: item.id === id,
      }));
      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}

      const activeItem = updated.find((item) => item.id === id);
      if (activeItem) {
        setPrimaryPhoneInput(activeItem.number);
        updateControl('cfg_whatsapp_phone', { actionValue: activeItem.number });
        updateControl('cfg_bespoke_phone', { actionValue: activeItem.number });
        setSavedSuccessMsg(isAr ? `تم اعتماد الرقم (${activeItem.number}) كالرقم النشط لجميع الطلبات` : `Switched active line to (${activeItem.number})`);
      }

      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3500);
      return updated;
    });
  };

  const handleAddNewPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newPhoneInput.replace(/[^0-9+]/g, '').trim();
    if (!cleanNum) return;

    const newEntry = {
      id: Date.now().toString(),
      number: cleanNum,
      label: newPhoneLabel.trim() || (isAr ? `رقم واتساب #${whatsappNumbers.length + 1}` : `WhatsApp Line #${whatsappNumbers.length + 1}`),
      isActive: whatsappNumbers.length === 0,
    };

    const updated = [...whatsappNumbers, newEntry];
    setWhatsappNumbers(updated);
    try {
      localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
    } catch {}

    if (newEntry.isActive) {
      setPrimaryPhoneInput(newEntry.number);
      updateControl('cfg_whatsapp_phone', { actionValue: newEntry.number });
      updateControl('cfg_bespoke_phone', { actionValue: newEntry.number });
    }

    setNewPhoneInput('');
    setNewPhoneLabel('');
    setShowAddForm(false);
    setSavedSuccessMsg(isAr ? `تمت إضافة الرقم (${cleanNum}) إلى القائمة بنجاح` : `Added (${cleanNum}) to directory`);
    setPhoneSaveSuccess(true);
    setTimeout(() => setPhoneSaveSuccess(false), 3500);
  };

  const handleStartEditPhone = (entry: { id: string; number: string; label: string }) => {
    setEditingPhoneId(entry.id);
    setEditingPhoneInput(entry.number);
    setEditingPhoneLabel(entry.label);
  };

  const handleSaveEditedPhone = (id: string) => {
    const cleanNum = editingPhoneInput.replace(/[^0-9+]/g, '').trim();
    if (!cleanNum) return;

    setWhatsappNumbers((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            number: cleanNum,
            label: editingPhoneLabel.trim() || item.label,
          };
        }
        return item;
      });

      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}

      const editedItem = updated.find((item) => item.id === id);
      if (editedItem?.isActive) {
        setPrimaryPhoneInput(cleanNum);
        updateControl('cfg_whatsapp_phone', { actionValue: cleanNum });
        updateControl('cfg_bespoke_phone', { actionValue: cleanNum });
      }

      setSavedSuccessMsg(isAr ? 'تم تعديل وحفظ بيانات الرقم بنجاح' : 'Number updated successfully');
      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3500);
      return updated;
    });

    setEditingPhoneId(null);
  };

  const handleDeletePhone = (id: string) => {
    setWhatsappNumbers((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((item) => item.id !== id);
      const hasActive = updated.some((item) => item.isActive);
      if (!hasActive && updated.length > 0) {
        updated[0].isActive = true;
        setPrimaryPhoneInput(updated[0].number);
        updateControl('cfg_whatsapp_phone', { actionValue: updated[0].number });
        updateControl('cfg_bespoke_phone', { actionValue: updated[0].number });
      }
      try {
        localStorage.setItem(WHATSAPP_NUMBERS_KEY, JSON.stringify(updated));
      } catch {}
      setSavedSuccessMsg(isAr ? 'تم حذف الرقم من القائمة' : 'Number removed from list');
      setPhoneSaveSuccess(true);
      setTimeout(() => setPhoneSaveSuccess(false), 3000);
      return updated;
    });
  };



  return (
                  <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.07] via-white/[0.02] to-black/40 p-6 space-y-6 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <MessageCircle className="h-4 w-4" />
                          </span>
                          <span>{isAr ? 'إدارة رقم الواتساب المعتمد وتعدد الأرقام' : 'WhatsApp Store Line & Multi-Number Manager'}</span>
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          {isAr
                            ? 'ضع الرقم المعتمد للمتجر ليتم حفظه واعتماده فوراً لجميع طلبات الزبائن واستفسارات المقاسات، مع إمكانية إضافة عدة أرقام والتبديل بينها.'
                            : 'Set and adopt your store WhatsApp number instantly for customer inquiries, with support for multiple phone lines.'}
                        </p>
                      </div>

                      {phoneSaveSuccess && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 text-xs font-bold text-emerald-300 animate-fade-in shadow-lg shrink-0">
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>{savedSuccessMsg || (isAr ? 'تم حفظ واعتماد الرقم بنجاح' : 'Saved & Adopted Successfully')}</span>
                        </div>
                      )}
                    </div>

                    {/* SECTION 1: PRIMARY SINGLE NUMBER INPUT & INSTANT ADOPT */}
                    <div className="rounded-2xl border border-emerald-500/30 bg-black/60 p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{isAr ? 'الرقم المعتمد والنشط حالياً للمتجر:' : 'Active & Adopted Store WhatsApp Number:'}</span>
                        </label>
                        <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          {isAr ? 'يتم توجيه جميع الطلبات إليه' : 'All orders route here'}
                        </span>
                      </div>

                      <form onSubmit={handleSavePrimaryPhone} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            required
                            dir="ltr"
                            placeholder={isAr ? 'أدخل رقم الواتساب (مثال: 9647800000000 أو +964...)' : 'Enter WhatsApp Number (e.g. 9647800000000)'}
                            value={primaryPhoneInput}
                            onChange={(e) => setPrimaryPhoneInput(e.target.value)}
                            className="h-12 w-full rounded-xl border border-emerald-500/30 bg-black/80 px-4 text-sm font-mono font-bold text-white placeholder:text-white/30 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 tracking-wider shadow-inner"
                          />
                        </div>

                        <button
                          type="submit"
                          className="h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0"
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>{isAr ? 'حفظ واعتماد هذا الرقم' : 'Save & Adopt Line'}</span>
                        </button>
                      </form>

                      {/* Live Adopted Banner Display */}
                      {(() => {
                        const activePhone = whatsappNumbers.find((n) => n.isActive) || whatsappNumbers[0];
                        const activeNum = activePhone ? activePhone.number : primaryPhoneInput;
                        const activeClean = activeNum.replace(/[^0-9]/g, '');
                        const testUrl = activeClean ? `https://wa.me/${activeClean}?text=${encodeURIComponent('تجربة اتصال من لوحة تحكم ڤانت')}` : '#';

                        return (
                          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                <MessageCircle className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-mono text-base font-extrabold text-white tracking-widest" dir="ltr">
                                    {activeNum}
                                  </span>
                                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30 uppercase">
                                    {isAr ? 'معتمد ونشط' : 'Active'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-white/50 block mt-0.5">
                                  {activePhone?.label || (isAr ? 'رقم الواتساب الرئيسي لـ ڤانت' : 'Primary VANT WhatsApp')}
                                </span>
                              </div>
                            </div>

                            <a
                              href={testUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 transition-all active:scale-95 cursor-pointer shrink-0"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>{isAr ? 'تجربة فتح المحادثة على واتساب' : 'Test WhatsApp Chat'}</span>
                            </a>
                          </div>
                        );
                      })()}
                    </div>

                    {/* SECTION 2: MULTI-NUMBER MANAGEMENT & DIRECTORY */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{isAr ? `إدارة وتعدد الأرقام (${whatsappNumbers.length})` : `Saved Numbers Directory (${whatsappNumbers.length})`}</span>
                          </h4>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            {isAr
                              ? 'يمكنك إضافة أكثر من رقم والتبديل بينها أو تعديلها في أي وقت بنقرة واحدة.'
                              : 'Add multiple numbers and switch or edit active lines anytime.'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{showAddForm ? (isAr ? 'إغلاق النموذج' : 'Close') : (isAr ? '+ إضافة رقم إضافي' : '+ Add Number')}</span>
                        </button>
                      </div>

                      {/* Add New Phone Accordion Form */}
                      {showAddForm && (
                        <form onSubmit={handleAddNewPhone} className="rounded-2xl border border-emerald-500/30 bg-black/60 p-4 space-y-3 animate-fade-in">
                          <h5 className="text-xs font-bold text-white flex items-center gap-2">
                            <Plus className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{isAr ? 'إضافة رقم واتساب إضافي' : 'Add Additional WhatsApp Line'}</span>
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            <div className="sm:col-span-6">
                              <input
                                type="text"
                                required
                                dir="ltr"
                                placeholder={isAr ? 'رقم الهاتف (مثال: 9647XXXXXXXXX)' : 'Phone number (e.g. 9647XXXXXXXXX)'}
                                value={newPhoneInput}
                                onChange={(e) => setNewPhoneInput(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/15 bg-black/80 px-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-400 font-mono"
                              />
                            </div>

                            <div className="sm:col-span-4">
                              <input
                                type="text"
                                placeholder={isAr ? 'تسمية الرقم (مثال: مبيعات دبي / خدمة العملاء)' : 'Label (e.g. Sales / Customer Care)'}
                                value={newPhoneLabel}
                                onChange={(e) => setNewPhoneLabel(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/15 bg-black/80 px-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-400"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <button
                                type="submit"
                                className="h-10 w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                              >
                                <Plus className="h-4 w-4" />
                                <span>{isAr ? 'إضافة' : 'Add'}</span>
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Saved Numbers Directory List with Inline Editing */}
                      <div className="space-y-2">
                        {whatsappNumbers.map((entry) => {
                          const isEditing = editingPhoneId === entry.id;
                          const cleanNum = entry.number.replace(/[^0-9]/g, '');
                          const waUrl = cleanNum ? `https://wa.me/${cleanNum}` : '#';

                          return (
                            <div
                              key={entry.id}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                entry.isActive
                                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-md'
                                  : 'border-white/10 bg-black/40 hover:border-white/20'
                              }`}
                            >
                              {isEditing ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                    <div className="sm:col-span-6">
                                      <input
                                        type="text"
                                        dir="ltr"
                                        value={editingPhoneInput}
                                        onChange={(e) => setEditingPhoneInput(e.target.value)}
                                        className="h-9 w-full rounded-xl border border-emerald-500/40 bg-black px-3 text-xs font-mono text-white outline-none"
                                        placeholder="9647XXXXXXXXX"
                                      />
                                    </div>
                                    <div className="sm:col-span-6">
                                      <input
                                        type="text"
                                        value={editingPhoneLabel}
                                        onChange={(e) => setEditingPhoneLabel(e.target.value)}
                                        className="h-9 w-full rounded-xl border border-white/20 bg-black px-3 text-xs text-white outline-none"
                                        placeholder={isAr ? 'تسمية الرقم' : 'Label'}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingPhoneId(null)}
                                      className="rounded-xl border border-white/10 px-3 py-1 text-xs text-white/60 hover:text-white"
                                    >
                                      {isAr ? 'إلغاء' : 'Cancel'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditedPhone(entry.id)}
                                      className="rounded-xl bg-emerald-500 text-black font-bold px-3 py-1 text-xs hover:bg-emerald-400"
                                    >
                                      {isAr ? 'حفظ التعديل' : 'Save'}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleSetActivePhone(entry.id)}
                                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                        entry.isActive
                                          ? 'border-emerald-400 bg-emerald-500 text-black shadow-sm shadow-emerald-500/50'
                                          : 'border-white/30 hover:border-white/60 bg-transparent'
                                      }`}
                                      title={isAr ? 'اعتماد هذا الرقم' : 'Set as Active'}
                                    >
                                      {entry.isActive && <Check className="h-3 w-3 stroke-[3]" />}
                                    </button>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-white tracking-wider" dir="ltr">
                                          {entry.number}
                                        </span>
                                        {entry.isActive && (
                                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9.5px] font-extrabold text-emerald-300 border border-emerald-500/30">
                                            {isAr ? 'معتمد ونشط' : 'Active'}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] text-white/50 block mt-0.5">{entry.label}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                    {!entry.isActive && (
                                      <button
                                        type="button"
                                        onClick={() => handleSetActivePhone(entry.id)}
                                        className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
                                      >
                                        {isAr ? 'اعتماد كالرقم النشط' : 'Adopt as Active'}
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleStartEditPhone(entry)}
                                      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:text-white transition-all cursor-pointer"
                                      title={isAr ? 'تعديل' : 'Edit'}
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>

                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all cursor-pointer"
                                    >
                                      {isAr ? 'واتساب' : 'WhatsApp'}
                                    </a>

                                    {whatsappNumbers.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePhone(entry.id)}
                                        className="h-8 w-8 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all cursor-pointer"
                                        title={isAr ? 'حذف الرقم' : 'Delete'}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

  );
};

export default AdminWhatsAppManager;
