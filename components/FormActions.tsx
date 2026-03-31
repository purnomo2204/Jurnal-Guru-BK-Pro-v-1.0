import React from 'react';
import { Save, X, LogOut } from 'lucide-react';

interface FormActionsProps {
  onSaveLocal: () => void;
  onSaveOnline?: () => void; // Kept for compatibility but not used in UI
  onCancel: () => void;
  onClose: () => void;
  isSaving?: boolean;
  saveLabel?: string;
}

const FormActions: React.FC<FormActionsProps> = ({ onSaveLocal, onCancel, onClose, isSaving, saveLabel = "SIMPAN" }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-3">
      <button 
        type="button"
        onClick={onSaveLocal}
        disabled={isSaving}
        className="flex-1 min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-md font-black text-[8px] uppercase tracking-[0.2em] shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-50"
      >
        <Save className="w-2.5 h-2.5" /> {saveLabel}
      </button>
      <button 
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="px-3 bg-white hover:bg-slate-50 text-slate-500 py-1.5 rounded-md font-black text-[8px] uppercase tracking-[0.2em] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1 border border-slate-200 disabled:opacity-50"
      >
        <X className="w-2.5 h-2.5" /> BATAL
      </button>
      <button 
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 rounded-md font-black text-[8px] uppercase tracking-[0.2em] shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1 border border-rose-100 disabled:opacity-50"
      >
        <LogOut className="w-2.5 h-2.5" /> TUTUP
      </button>
    </div>
  );
};

export default FormActions;
