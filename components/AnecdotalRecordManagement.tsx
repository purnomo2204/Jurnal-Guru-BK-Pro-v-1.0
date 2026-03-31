
import React, { useState, useMemo, useRef } from 'react';
import { ViewMode, EventLog, TeacherData, Student } from '../types';
import { 
  Plus, Search, Calendar, Clock, Edit, Trash2, 
  X, Save, ClipboardList, Info, ArrowLeft, 
  Eye, CheckCircle2, AlertCircle, FileText, User, Users, ShieldCheck, FileDown, ImageIcon, Upload, Filter
} from 'lucide-react';
import FormActions from './FormActions';

interface AnecdotalRecordManagementProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  logs: EventLog[];
  students: Student[];
  onAdd: (log: EventLog, sync?: boolean) => void;
  onUpdate: (log: EventLog, sync?: boolean) => void;
  onDelete: (id: string) => void;
  teacherData: TeacherData;
}

const AnecdotalRecordManagement: React.FC<AnecdotalRecordManagementProps> = ({ 
  view, setView, logs, students, onAdd, onUpdate, onDelete, teacherData 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('SEMUA');
  const [statusFilter, setStatusFilter] = useState('SEMUA');
  const [previewLog, setPreviewLog] = useState<EventLog | null>(null);
  const [inputClassFilter, setInputClassFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<EventLog>>({
    date: new Date().toISOString().split('T')[0],
    time: '',
    studentId: '',
    studentName: '',
    className: '',
    homeroomTeacher: '',
    description: '',
    resolution: '',
    followUp: '',
    notes: '',
    photo: ''
  });

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = 
        l.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.resolution.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = classFilter === 'SEMUA' || l.className === classFilter;
      const matchesStatus = statusFilter === 'SEMUA' || l.resolution.toLowerCase().includes(statusFilter.toLowerCase());
      
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [logs, searchQuery, classFilter, statusFilter]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setFormData(prev => ({ ...prev, photo: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (syncOnline: boolean = true) => {
    if (editingId) {
      onUpdate({ ...formData as EventLog, id: editingId }, syncOnline);
    } else {
      onAdd({ ...formData as EventLog, id: Date.now().toString() }, syncOnline);
    }
    resetForm();
    setView(ViewMode.ANECDOTAL_RECORD_DATA);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setInputClassFilter('');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '',
      studentId: '',
      studentName: '',
      className: '',
      homeroomTeacher: '',
      description: '',
      resolution: '',
      followUp: '',
      notes: '',
      photo: ''
    });
  };

  const startEdit = (log: EventLog) => {
    setEditingId(log.id);
    setFormData(log);
    setInputClassFilter(log.className);
    setView(ViewMode.ANECDOTAL_RECORD_INPUT);
  };

  const handleDownloadDocx = (log: EventLog) => {
    const content = `
      CATATAN ANEKDOT - JURNAL GURU BK PRO
      ------------------------------------
      Tanggal: ${log.date}
      Jam: ${log.time}
      Nama Siswa: ${log.studentName}
      Kelas: ${log.className}
      Wali Kelas: ${log.homeroomTeacher}
      
      DESKRIPSI PERILAKU:
      ${log.description}
      
      ANALISIS/INTERPRETASI:
      ${log.resolution}
      
      REKOMENDASI/TINDAK LANJUT:
      ${log.followUp}
      
      CATATAN LAINNYA:
      ${log.notes || '-'}
      
      [Dokumentasi foto tersimpan dalam sistem aplikasi]
    `;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Catatan_Anekdot_${log.studentName.replace(/\s+/g, '_')}_${log.date}.doc`;
    link.click();
  };

  const availableClasses = useMemo(() => {
    const cls = new Set(students.map(s => s.className));
    return Array.from(cls).sort();
  }, [students]);

  const filteredStudentsForInput = useMemo(() => {
    if (!inputClassFilter) return students;
    return students.filter(s => s.className === inputClassFilter);
  }, [students, inputClassFilter]);

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        homeroomTeacher: student.homeroomTeacher || ''
      });
    } else {
      setFormData({
        ...formData,
        studentId: '',
        studentName: '',
        className: '',
        homeroomTeacher: ''
      });
    }
  };

  if (view === ViewMode.ANECDOTAL_RECORD_INPUT) {
    return (
      <div className="max-w-3xl mx-auto glass-card p-6 rounded-2xl border border-slate-200 shadow-3xl animate-fade-in text-left mb-10 bg-white/60">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 rounded-xl text-white shadow-xl">
               <ClipboardList className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Input <span className="text-blue-500 font-light italic">Anekdot</span></h2>
                <p className="label-luxe text-blue-500 text-[8px] mt-1">Dokumentasi Perilaku Siswa</p>
             </div>
          </div>
          <button onClick={() => { resetForm(); setView(ViewMode.ANECDOTAL_RECORD_DATA); }} className="p-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-200 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="label-luxe flex items-center gap-1 text-[7px]"><Calendar className="w-2.5 h-2.5" /> Tanggal Kejadian</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full input-cyber p-2 text-[10px] rounded-lg" />
            </div>
            <div className="space-y-1">
              <label className="label-luxe flex items-center gap-1 text-[7px]"><Clock className="w-2.5 h-2.5" /> Jam Kejadian</label>
              <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full input-cyber p-2 text-[10px] rounded-lg" />
            </div>
          </div>

          <div className="p-3 bg-white/60 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-1 mb-1">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-500" />
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Identitas Pihak Terlibat</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="label-luxe flex items-center gap-1 text-[7px]"><Filter className="w-2.5 h-2.5" /> 1. Filter Kelas</label>
                <select 
                  value={inputClassFilter} 
                  onChange={e => { setInputClassFilter(e.target.value); handleStudentSelect(''); }} 
                  className="w-full input-cyber p-2 text-[10px] rounded-lg"
                >
                  <option value="">Semua Kelas</option>
                  {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-luxe flex items-center gap-1 text-[7px]"><Users className="w-2.5 h-2.5" /> 2. Pilih Peserta Didik</label>
                <select 
                  required 
                  value={students.find(s => s.name === formData.studentName && s.className === formData.className)?.id || ''} 
                  onChange={e => handleStudentSelect(e.target.value)} 
                  className="w-full input-cyber p-2 text-[10px] rounded-lg"
                >
                  <option value="">-- Pilih Nama Siswa --</option>
                  {filteredStudentsForInput.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="label-luxe flex items-center gap-1 text-[7px]"><User className="w-2.5 h-2.5" /> Nama Siswa (Konfirmasi)</label>
                <input readOnly required value={formData.studentName} className="w-full input-cyber p-2 text-[10px] bg-slate-50/50 border-slate-200 cursor-not-allowed rounded-lg" placeholder="Pilih siswa di atas..." />
              </div>
              <div className="space-y-1">
                <label className="label-luxe flex items-center gap-1 text-[7px]"><Users className="w-2.5 h-2.5" /> Kelas</label>
                <input readOnly required value={formData.className} className="w-full input-cyber p-2 text-[10px] bg-slate-50/50 border-slate-200 cursor-not-allowed rounded-lg" placeholder="Otomatis terisi..." />
              </div>
              <div className="space-y-1">
                <label className="label-luxe flex items-center gap-1 text-[7px]"><User className="w-2.5 h-2.5" /> Nama Wali Kelas</label>
                <input readOnly required value={formData.homeroomTeacher} className="w-full input-cyber p-2 text-[10px] bg-slate-50/50 border-slate-200 cursor-not-allowed rounded-lg" placeholder="Otomatis terisi..." />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1 space-y-1">
               <label className="label-luxe flex items-center gap-1 text-blue-500 text-[7px]"><ImageIcon className="w-2.5 h-2.5" /> Dokumentasi Foto</label>
               <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-[4/3] w-full rounded-lg bg-white/60 border border-dashed border-blue-500/30 flex flex-col items-center justify-center overflow-hidden cursor-pointer group hover:border-blue-500 transition-all"
               >
                 {formData.photo ? (
                   <>
                    <img src={formData.photo} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-slate-50/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Upload className="w-4 h-4 text-slate-800" />
                    </div>
                   </>
                 ) : (
                   <div className="text-center space-y-0.5 p-1">
                      <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-0.5 text-blue-500">
                        <Plus className="w-3 h-3" />
                      </div>
                      <p className="text-[7px] font-black text-blue-500 uppercase tracking-widest leading-tight">Klik Untuk Upload</p>
                      <p className="text-[6px] text-slate-500 font-bold uppercase tracking-tight">JPEG / PNG (Maks 2MB)</p>
                   </div>
                 )}
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png" onChange={handlePhotoChange} />
               </div>
               {formData.photo && (
                 <button 
                  type="button" 
                  onClick={() => setFormData({...formData, photo: ''})}
                  className="w-full py-0.5 bg-rose-900/20 text-rose-500 text-[6px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-600 hover:text-white transition-all"
                 >Hapus Foto</button>
               )}
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="label-luxe flex items-center gap-1 text-rose-400 text-[7px]"><Info className="w-2.5 h-2.5" /> Deskripsi Perilaku</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full input-cyber p-2 h-full min-h-[100px] text-[10px] leading-relaxed rounded-lg" placeholder="Deskripsikan perilaku siswa secara objektif..." />
            </div>
          </div>

          <div className="space-y-1">
            <label className="label-luxe flex items-center gap-1 text-emerald-400 text-[7px]"><CheckCircle2 className="w-2.5 h-2.5" /> Analisis/Interpretasi</label>
            <textarea required value={formData.resolution} onChange={e => setFormData({...formData, resolution: e.target.value})} className="w-full input-cyber p-2 h-16 text-[10px] leading-relaxed rounded-lg" placeholder="Analisis perilaku dan kemungkinan penyebabnya..." />
          </div>

          <div className="space-y-1">
            <label className="label-luxe flex items-center gap-1 text-blue-400 text-[7px]"><FileText className="w-2.5 h-2.5" /> Rekomendasi/Tindak Lanjut</label>
            <input required value={formData.followUp} onChange={e => setFormData({...formData, followUp: e.target.value})} className="w-full input-cyber p-2 text-[10px] rounded-lg" placeholder="Rencana atau rekomendasi selanjutnya..." />
          </div>

          <div className="space-y-1">
            <label className="label-luxe flex items-center gap-1 text-slate-500 text-[7px]">Catatan / Keterangan</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full input-cyber p-2 h-12 text-[10px] rounded-lg" placeholder="Catatan tambahan lainnya..." />
          </div>

          <FormActions 
            onSaveLocal={() => handleSave(false)}
            onSaveOnline={() => handleSave(true)}
            onCancel={() => { resetForm(); setView(ViewMode.ANECDOTAL_RECORD_DATA); }}
            onClose={() => { resetForm(); setView(ViewMode.ANECDOTAL_RECORD_DATA); }}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="flex items-center gap-5">
           <button onClick={() => setView(ViewMode.HOME)} className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all group shadow-lg">
             <ArrowLeft className="w-6 h-6 text-slate-500 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <p className="label-luxe text-blue-500 font-black text-[9px]">HISTORY LOG</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Catatan <span className="text-blue-500 font-light italic lowercase">Anekdot</span></h2>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input 
              type="text" 
              placeholder="Cari..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input-cyber rounded-lg py-2 pl-8 pr-3 text-[10px] text-slate-600 outline-none focus:ring-1 focus:ring-blue-500/20" 
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-blue-500" />
            <select 
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            >
              <option value="SEMUA">SEMUA KELAS</option>
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
            >
              <option value="SEMUA">SEMUA STATUS</option>
              <option value="Selesai">Selesai</option>
              <option value="Pending">Pending</option>
              <option value="Proses">Proses</option>
            </select>
          </div>
          <button onClick={() => { resetForm(); setView(ViewMode.ANECDOTAL_RECORD_INPUT); }} className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-1">
            <Plus className="w-3 h-3" /> TAMBAH
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
        {filteredLogs.length === 0 ? (
          <div className="col-span-full py-24 text-center glass-card rounded-[3.5rem] border border-dashed border-rose-500/20 bg-white/60">
             <AlertCircle className="w-16 h-16 text-rose-900 mx-auto mb-4 opacity-30" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs italic">Belum ada catatan anekdot terdokumentasi.</p>
          </div>
        ) : filteredLogs.map(log => (
          <div key={log.id} className="glass-card p-8 rounded-[2.5rem] border border-slate-200 bg-white/60 flex flex-col group transition-all hover:border-blue-500/30">
             <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-500 shadow-sm"><Calendar className="w-3.5 h-3.5" /></div>
                <div className="flex gap-1">
                   <button onClick={() => setPreviewLog(log)} title="Lihat Detail" className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-blue-600/20 rounded-lg text-blue-400 transition-all"><Eye className="w-3 h-3" /></button>
                   <button onClick={() => startEdit(log)} title="Edit" className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-blue-600/20 rounded-lg text-indigo-400 transition-all"><Edit className="w-3 h-3" /></button>
                   <button onClick={() => { if(confirm('Hapus catatan ini?')) onDelete(log.id); }} title="Hapus" className="p-1.5 bg-rose-900/20 border border-rose-500/30 hover:bg-rose-600 rounded-lg text-rose-400 hover:text-white transition-all"><Trash2 className="w-3 h-3" /></button>
                </div>
             </div>
             
             <div className="mb-3">
                <div className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{log.studentName}</div>
                <div className="text-[8px] text-blue-500 font-bold flex items-center gap-1 mt-0.5">
                    <Users className="w-2.5 h-2.5" /> Kelas {log.className}
                </div>
             </div>

             <div className="flex items-center gap-2 mb-3">
                <div className="text-[9px] font-black text-slate-600">{new Date(log.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</div>
                <div className="text-[7px] text-blue-500 font-black flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {log.time} WIB</div>
             </div>

             <div className="flex-1 space-y-2">
                {log.photo && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-200 mb-1">
                    <img src={log.photo} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Doc" />
                  </div>
                )}
                <div className="line-clamp-2 text-[9px] text-slate-500 leading-relaxed font-medium italic">"{log.description}"</div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                   <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Penyelesaian:</p>
                   <p className="text-[8px] font-bold text-slate-700 line-clamp-1">{log.resolution}</p>
                </div>
             </div>

             <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between">
                <button onClick={() => handleDownloadDocx(log)} className="flex items-center gap-1 text-[7px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-all">
                    <FileDown className="w-3 h-3" /> DOCX
                </button>
             </div>
          </div>
        ))}
      </div>

      {previewLog && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md" onClick={() => setPreviewLog(null)} />
           <div className="relative glass-card w-full max-w-2xl rounded-[4rem] border border-slate-200 p-12 shadow-3xl bg-white animate-in zoom-in-95 duration-300">
              
              <div className="flex justify-between items-start mb-10">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-2xl"><ClipboardList className="w-8 h-8" /></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Detail Catatan Anekdot</h3>
                       <p className="text-[10px] text-blue-500 font-black mt-1 uppercase tracking-widest">{new Date(previewLog.date).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})} | {previewLog.time} WIB</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setPreviewLog(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-blue-500 transition-all"><X className="w-5 h-5" /></button>
                 </div>
              </div>

               <div className="space-y-8 h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200">
                       <label className="label-luxe text-blue-500">Nama Siswa</label>
                       <div className="text-lg font-black text-slate-800 mt-1">{previewLog.studentName}</div>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200">
                       <label className="label-luxe text-blue-500">Kelas / Wali Kelas</label>
                       <div className="text-sm font-bold text-slate-500 mt-1">{previewLog.className} / {previewLog.homeroomTeacher}</div>
                    </div>
                 </div>

                 {previewLog.photo && (
                   <div className="space-y-3">
                      <label className="label-luxe text-blue-500">Dokumentasi Perilaku</label>
                      <div className="w-full rounded-3xl overflow-hidden border border-slate-200">
                         <img src={previewLog.photo} className="w-full object-contain max-h-[300px]" alt="Doc" />
                      </div>
                   </div>
                 )}

                 <div className="space-y-3">
                    <label className="label-luxe text-blue-500">Deskripsi Perilaku</label>
                    <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200 text-sm text-slate-500 italic font-medium leading-relaxed">"{previewLog.description}"</div>
                 </div>
                 <div className="space-y-3">
                    <label className="label-luxe text-emerald-500">Analisis/Interpretasi</label>
                    <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-sm text-emerald-400 font-bold leading-relaxed">{previewLog.resolution}</div>
                 </div>
                 <div className="space-y-3">
                    <label className="label-luxe text-blue-500">Rekomendasi/Tindak Lanjut</label>
                    <div className="p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20 text-sm text-blue-400 font-bold leading-relaxed">{previewLog.followUp}</div>
                 </div>
                 {previewLog.notes && (
                   <div className="space-y-3">
                      <label className="label-luxe text-slate-500">Catatan Lainnya</label>
                      <div className="p-6 bg-slate-100/30 rounded-3xl border border-slate-200 text-xs text-slate-500 font-medium">{previewLog.notes}</div>
                   </div>
                 )}
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => handleDownloadDocx(previewLog)} className="flex-1 bg-slate-100 border border-slate-200 text-slate-500 font-black py-6 rounded-3xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200">
                    <FileDown className="w-5 h-5" /> DOWNLOAD DOCX
                </button>
                <button onClick={() => setPreviewLog(null)} className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white font-black py-6 rounded-3xl transition-all text-xs uppercase tracking-widest shadow-2xl">TUTUP DETAIL</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AnecdotalRecordManagement;
