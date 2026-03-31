import React, { useState, useMemo, useRef } from 'react';
import { ViewMode, Achievement, Scholarship, TeacherData, Student, EconomicallyDisadvantagedStudent } from '../types';
import { 
  Plus, Search, Calendar, Clock, Edit, Trash2, 
  X, Save, ClipboardList, Info, ArrowLeft, 
  Eye, CheckCircle2, AlertCircle, FileText, User, Users, ShieldCheck, FileDown, ImageIcon, Upload, Filter, Sparkles, TrendingUp, GraduationCap, DollarSign
} from 'lucide-react';
import FormActions from './FormActions';
import { useFormDraft } from '../hooks/useFormDraft';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, AlignmentType, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import { formatAcademicTitle } from '../src/lib/nameFormatter';

interface AchievementManagementProps {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  achievements: Achievement[];
  scholarships?: Scholarship[];
  economicallyDisadvantagedStudents?: EconomicallyDisadvantagedStudent[];
  students: Student[];
  onAdd: (achievement: Achievement, sync?: boolean) => void;
  onUpdate: (achievement: Achievement, sync?: boolean) => void;
  onDelete: (id: string) => void;
  onAddScholarship?: (scholarship: Scholarship, sync?: boolean) => void;
  onUpdateScholarship?: (scholarship: Scholarship, sync?: boolean) => void;
  onDeleteScholarship?: (id: string) => void;
  onAddEconomicallyDisadvantagedStudent?: (student: EconomicallyDisadvantagedStudent, sync?: boolean) => void;
  onUpdateEconomicallyDisadvantagedStudent?: (student: EconomicallyDisadvantagedStudent, sync?: boolean) => void;
  onDeleteEconomicallyDisadvantagedStudent?: (id: string) => void;
  teacherData: TeacherData;
}

const AchievementManagement: React.FC<AchievementManagementProps> = ({ 
  view, setView, achievements, scholarships = [], economicallyDisadvantagedStudents = [], students, onAdd, onUpdate, onDelete, onAddScholarship, onUpdateScholarship, onDeleteScholarship, onAddEconomicallyDisadvantagedStudent, onUpdateEconomicallyDisadvantagedStudent, onDeleteEconomicallyDisadvantagedStudent, teacherData 
}) => {
  const [activeTab, setActiveTab] = useState<'prestasi' | 'beasiswa' | 'siswa-tidak-mampu'>('prestasi');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAchievement, setPreviewAchievement] = useState<Achievement | null>(null);
  const [previewScholarship, setPreviewScholarship] = useState<Scholarship | null>(null);
  const [previewEconomicallyDisadvantagedStudent, setPreviewEconomicallyDisadvantagedStudent] = useState<EconomicallyDisadvantagedStudent | null>(null);
  const [inputClassFilter, setInputClassFilter] = useState('');
  const [isInputMode, setIsInputMode] = useState(false);

  const [formData, setFormData, clearFormData] = useFormDraft<Partial<Achievement>>("draft_achievement", {
    date: new Date().getFullYear().toString(),
    studentId: '',
    achievement: '',
    achievementType: 'Akademik',
    level: 'sekolah',
    description: ''
  });

  const [scholarshipFormData, setScholarshipFormData, clearScholarshipFormData] = useFormDraft<Partial<Scholarship>>("draft_scholarship", {
    date: new Date().getFullYear().toString(),
    studentId: '',
    scholarshipName: '',
    level: 'sekolah',
    description: ''
  });

  const [economicallyDisadvantagedFormData, setEconomicallyDisadvantagedFormData, clearEconomicallyDisadvantagedFormData] = useFormDraft<Partial<EconomicallyDisadvantagedStudent>>("draft_economically_disadvantaged", {
    date: new Date().getFullYear().toString(),
    studentId: '',
    specialNotes: '',
    fatherJob: '',
    motherJob: '',
    address: '',
    assistanceStatus: 'TIDAK DAPAT',
    assistanceSource: ''
  });

  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const student = students.find(s => s.id === a.studentId);
      const studentName = student?.name || '';
      return (
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.achievement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [achievements, students, searchQuery]);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter(s => {
      const student = students.find(st => st.id === s.studentId);
      const studentName = student?.name || '';
      return (
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.scholarshipName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [scholarships, students, searchQuery]);

  const filteredEconomicallyDisadvantagedStudents = useMemo(() => {
    return economicallyDisadvantagedStudents.filter(s => {
      const student = students.find(st => st.id === s.studentId);
      const studentName = student?.name || '';
      return (
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialNotes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [economicallyDisadvantagedStudents, students, searchQuery]);

  const handleSave = (syncOnline: boolean = true) => {
    if (activeTab === 'prestasi') {
      if (editingId) {
        onUpdate({ ...formData as Achievement, id: editingId }, syncOnline);
      } else {
        onAdd({ ...formData as Achievement, id: Date.now().toString() }, syncOnline);
      }
    } else if (activeTab === 'beasiswa') {
      if (editingId && onUpdateScholarship) {
        onUpdateScholarship({ ...scholarshipFormData as Scholarship, id: editingId }, syncOnline);
      } else if (onAddScholarship) {
        onAddScholarship({ ...scholarshipFormData as Scholarship, id: Date.now().toString() }, syncOnline);
      }
    } else {
      if (editingId && onUpdateEconomicallyDisadvantagedStudent) {
        onUpdateEconomicallyDisadvantagedStudent({ ...economicallyDisadvantagedFormData as EconomicallyDisadvantagedStudent, id: editingId }, syncOnline);
      } else if (onAddEconomicallyDisadvantagedStudent) {
        onAddEconomicallyDisadvantagedStudent({ ...economicallyDisadvantagedFormData as EconomicallyDisadvantagedStudent, id: Date.now().toString() }, syncOnline);
      }
    }
    resetForm();
    setIsInputMode(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setInputClassFilter('');
    clearFormData();
    clearScholarshipFormData();
    clearEconomicallyDisadvantagedFormData();
  };

  const startEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setFormData(achievement);
    const student = students.find(s => s.id === achievement.studentId);
    if (student) setInputClassFilter(student.className);
    setIsInputMode(true);
  };

  const startEditScholarship = (scholarship: Scholarship) => {
    setEditingId(scholarship.id);
    setScholarshipFormData(scholarship);
    const student = students.find(s => s.id === scholarship.studentId);
    if (student) setInputClassFilter(student.className);
    setIsInputMode(true);
  };

  const startEditEconomicallyDisadvantagedStudent = (student: EconomicallyDisadvantagedStudent) => {
    setEditingId(student.id);
    setEconomicallyDisadvantagedFormData(student);
    const s = students.find(st => st.id === student.studentId);
    if (s) setInputClassFilter(s.className);
    setIsInputMode(true);
  };

  const availableClasses = useMemo(() => {
    const cls = new Set(students.map(s => s.className));
    return Array.from(cls).sort();
  }, [students]);

  const filteredStudentsForInput = useMemo(() => {
    if (!inputClassFilter) return students;
    return students.filter(s => s.className === inputClassFilter);
  }, [students, inputClassFilter]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.id === (activeTab === 'prestasi' ? formData.studentId : scholarshipFormData.studentId));
  }, [students, formData.studentId, scholarshipFormData.studentId, activeTab]);

  const exportToDocx = async (type: 'prestasi' | 'beasiswa' | 'siswa-tidak-mampu') => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: teacherData.school.toUpperCase(),
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: teacherData.schoolAddress,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "________________________________________________________________________________" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: type === 'prestasi' ? "LAPORAN PRESTASI SISWA" : type === 'beasiswa' ? "LAPORAN BEASISWA SISWA" : "LAPORAN SISWA TIDAK MAMPU",
            heading: "Heading2",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: type === 'siswa-tidak-mampu' ? [
                  new TableCell({ children: [new Paragraph({ text: "Nama Siswa", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Kelas", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Bantuan", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Sumber", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Alamat", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Pekerjaan Ayah", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Pekerjaan Ibu", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Catatan", style: "Strong" })] }),
                ] : [
                  new TableCell({ children: [new Paragraph({ text: "Nama Siswa", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Kelas", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Tanggal", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: type === 'prestasi' ? "Prestasi" : "Beasiswa", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Tingkat", style: "Strong" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Keterangan", style: "Strong" })] }),
                ],
              }),
              ...(type === 'prestasi' ? filteredAchievements : type === 'beasiswa' ? filteredScholarships : economicallyDisadvantagedStudents).map(item => {
                const student = students.find(s => s.id === item.studentId);
                if (type === 'siswa-tidak-mampu') {
                    const s = item as EconomicallyDisadvantagedStudent;
                    return new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: student?.name || '-' })] }),
                            new TableCell({ children: [new Paragraph({ text: student?.className || '-' })] }),
                            new TableCell({ children: [new Paragraph({ text: s.assistanceStatus || '-' })] }),
                            new TableCell({ children: [new Paragraph({ text: s.assistanceSource || '-' })] }),
                            new TableCell({ children: [new Paragraph({ text: s.address })] }),
                            new TableCell({ children: [new Paragraph({ text: s.fatherJob })] }),
                            new TableCell({ children: [new Paragraph({ text: s.motherJob })] }),
                            new TableCell({ children: [new Paragraph({ text: s.specialNotes })] }),
                        ],
                    });
                }
                return new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: student?.name || '-' })] }),
                    new TableCell({ children: [new Paragraph({ text: student?.className || '-' })] }),
                    new TableCell({ children: [new Paragraph({ text: new Date(item.date).toLocaleDateString('id-ID') })] }),
                    new TableCell({ children: [new Paragraph({ text: type === 'prestasi' ? (item as Achievement).achievement : (item as Scholarship).scholarshipName })] }),
                    new TableCell({ children: [new Paragraph({ text: item.level })] }),
                    new TableCell({ children: [new Paragraph({ text: item.description })] }),
                  ],
                });
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: `................, ${new Date().toLocaleDateString('id-ID')}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: "Mengetahui,",
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: "Kepala Sekolah",
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: formatAcademicTitle(teacherData.principalName), font: "Arial" }),
            ],
          }),
          new Paragraph({
            text: `NIP. ${teacherData.principalNip || "..................................."}`,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Laporan_${type === 'prestasi' ? 'Prestasi' : type === 'beasiswa' ? 'Beasiswa' : 'SiswaTidakMampu'}_${new Date().toISOString().split('T')[0]}.docx`);
  };

  if (isInputMode) {
    return (
      <div className="max-w-3xl mx-auto glass-card p-4 rounded-2xl border border-slate-200 shadow-xl animate-fade-in text-left mb-6 backdrop-blur-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500 border border-yellow-500/30 shadow-lg">
               {activeTab === 'prestasi' ? <Sparkles className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
             </div>
             <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  Input <span className="text-yellow-500 font-light italic">{activeTab === 'prestasi' ? 'Prestasi' : activeTab === 'beasiswa' ? 'Beasiswa' : 'Siswa Tidak Mampu'}</span>
                </h2>
                <p className="text-[7px] font-black text-yellow-500/60 uppercase tracking-widest mt-0.5">Dokumentasi {activeTab === 'prestasi' ? 'Pencapaian & Prestasi' : activeTab === 'beasiswa' ? 'Penerimaan Beasiswa' : 'Siswa Tidak Mampu'} Siswa</p>
             </div>
          </div>
          <button onClick={() => { resetForm(); setIsInputMode(false); }} className="p-1.5 bg-slate-50/50 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all backdrop-blur-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 space-y-2 shadow-inner">
            <div className="flex items-center gap-1 mb-0.5">
                <User className="w-2.5 h-2.5 text-yellow-500" />
                <span className="text-[7px] font-black text-yellow-500 uppercase tracking-widest">Identitas Siswa</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><Filter className="w-2.5 h-2.5" /> 1. Filter Kelas</label>
                <select 
                  value={inputClassFilter} 
                  onChange={e => { setInputClassFilter(e.target.value); activeTab === 'prestasi' ? setFormData({...formData, studentId: ''}) : activeTab === 'beasiswa' ? setScholarshipFormData({...scholarshipFormData, studentId: ''}) : setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, studentId: ''}); }} 
                  className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none"
                >
                  <option value="">Semua Kelas</option>
                  {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><Users className="w-2.5 h-2.5" /> 2. Pilih Peserta Didik</label>
                <select 
                  required 
                  value={activeTab === 'prestasi' ? formData.studentId : activeTab === 'beasiswa' ? scholarshipFormData.studentId : economicallyDisadvantagedFormData.studentId} 
                  onChange={e => activeTab === 'prestasi' ? setFormData({...formData, studentId: e.target.value}) : activeTab === 'beasiswa' ? setScholarshipFormData({...scholarshipFormData, studentId: e.target.value}) : setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, studentId: e.target.value})} 
                  className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none"
                >
                  <option value="">-- Pilih Nama Siswa --</option>
                  {students.filter(s => inputClassFilter === '' || s.className === inputClassFilter).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {activeTab === 'siswa-tidak-mampu' && (
              <>
                <div className="space-y-0.5">
                  <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><ClipboardList className="w-2.5 h-2.5" /> Bantuan</label>
                  <select 
                    required 
                    value={economicallyDisadvantagedFormData.assistanceStatus} 
                    onChange={e => setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, assistanceStatus: e.target.value as any})} 
                    className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none"
                  >
                    <option value="DAPAT">DAPAT</option>
                    <option value="TIDAK DAPAT">TIDAK DAPAT</option>
                    <option value="DALAM PROSES">DALAM PROSES</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><Info className="w-2.5 h-2.5" /> Sumber Bantuan</label>
                  <input 
                    required 
                    value={economicallyDisadvantagedFormData.assistanceSource} 
                    onChange={e => setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, assistanceSource: e.target.value})} 
                    className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none" 
                    placeholder="Sumber Bantuan..." 
                  />
                </div>
              </>
            )}
            <div className="space-y-0.5">
              <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Tahun Perolehan</label>
              <input type="text" required value={activeTab === 'prestasi' ? formData.date : activeTab === 'beasiswa' ? scholarshipFormData.date : economicallyDisadvantagedFormData.date} onChange={e => activeTab === 'prestasi' ? setFormData({...formData, date: e.target.value}) : activeTab === 'beasiswa' ? setScholarshipFormData({...scholarshipFormData, date: e.target.value}) : setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, date: e.target.value})} className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none" placeholder="Contoh: 2025, 2025/2026, dll..." />
            </div>
            <div className="space-y-0.5">
              <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> Tingkat {activeTab === 'prestasi' ? 'Prestasi' : activeTab === 'beasiswa' ? 'Beasiswa' : ''}</label>
              <select 
                required 
                value={activeTab === 'prestasi' ? formData.level : activeTab === 'beasiswa' ? scholarshipFormData.level : economicallyDisadvantagedFormData.level} 
                onChange={e => activeTab === 'prestasi' ? setFormData({...formData, level: e.target.value as any}) : activeTab === 'beasiswa' ? setScholarshipFormData({...scholarshipFormData, level: e.target.value as any}) : setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, level: e.target.value as any})} 
                className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none"
              >
                <option value="sekolah">Sekolah</option>
                <option value="kota">Kota / Kabupaten</option>
                <option value="provinsi">Provinsi</option>
                <option value="nasional">Nasional</option>
                <option value="internasional">Internasional</option>
              </select>
            </div>
          </div>

          {activeTab === 'prestasi' && (
            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500" /> Jenis Prestasi</label>
              <select 
                required 
                value={formData.achievementType} 
                onChange={e => setFormData({...formData, achievementType: e.target.value as any})} 
                className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none"
              >
                <option value="Akademik">Akademik</option>
                <option value="Non Akademik">Non Akademik</option>
              </select>
            </div>
          )}

          {activeTab === 'siswa-tidak-mampu' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">Pekerjaan Ayah</label>
                <input required value={economicallyDisadvantagedFormData.fatherJob} onChange={e => setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, fatherJob: e.target.value})} className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none" placeholder="Pekerjaan Ayah" />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">Pekerjaan Ibu</label>
                <input required value={economicallyDisadvantagedFormData.motherJob} onChange={e => setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, motherJob: e.target.value})} className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none" placeholder="Pekerjaan Ibu" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1">Alamat</label>
                <input required value={economicallyDisadvantagedFormData.address} onChange={e => setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, address: e.target.value})} className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none" placeholder="Alamat" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500" /> {activeTab === 'prestasi' ? 'Nama Prestasi / Penghargaan' : activeTab === 'beasiswa' ? 'Nama Beasiswa' : 'Catatan Khusus'}</label>
            <input required value={activeTab === 'prestasi' ? formData.achievement : activeTab === 'beasiswa' ? scholarshipFormData.scholarshipName : economicallyDisadvantagedFormData.specialNotes} onChange={e => activeTab === 'prestasi' ? setFormData({...formData, achievement: e.target.value}) : activeTab === 'beasiswa' ? setScholarshipFormData({...scholarshipFormData, scholarshipName: e.target.value}) : setEconomicallyDisadvantagedFormData({...economicallyDisadvantagedFormData, specialNotes: e.target.value})} className="w-full input-cyber rounded-lg p-2 text-[10px] outline-none" placeholder={`Contoh: ${activeTab === 'prestasi' ? 'Juara 1 Lomba Matematika' : activeTab === 'beasiswa' ? 'Beasiswa PIP' : 'Keterangan khusus...'}, dll...`} />
          </div>

          {activeTab !== 'siswa-tidak-mampu' && (
            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1"><Info className="w-3 h-3" /> Catatan / Keterangan</label>
              <textarea required value={activeTab === 'prestasi' ? formData.description : scholarshipFormData.description} onChange={e => activeTab === 'prestasi' ? setFormData({...formData, description: e.target.value}) : setScholarshipFormData({...scholarshipFormData, description: e.target.value})} className="w-full input-cyber rounded-lg p-2 h-20 text-[10px] leading-relaxed outline-none" placeholder={`Jelaskan detail ${activeTab === 'prestasi' ? 'prestasi' : 'beasiswa'} yang diraih...`} />
            </div>
          )}

          <FormActions 
            onSaveLocal={() => handleSave(false)}
            onSaveOnline={() => handleSave(true)}
            onCancel={() => { resetForm(); setIsInputMode(false); }}
            onClose={() => { resetForm(); setIsInputMode(false); }}
          />
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
        <div className="flex items-center gap-3">
           <button onClick={() => setView(ViewMode.HOME)} className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-100 transition-all group shadow-md">
             <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <p className="label-luxe text-yellow-500 font-black text-[7px]">ACHIEVEMENT & SCHOLARSHIP LOG</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">Prestasi & <span className="text-yellow-500 font-light italic lowercase">Beasiswa</span></h2>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-yellow-500" />
            <input 
              type="text" 
              placeholder={`Cari siswa atau ${activeTab}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input-cyber rounded-lg py-2 pl-9 pr-3 text-[10px] text-slate-600 outline-none focus:ring-2 focus:ring-yellow-500/10" 
            />
          </div>
          <button onClick={() => exportToDocx(activeTab)} className="bg-slate-100 text-slate-600 border border-slate-300 px-3 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all shadow-sm hover:bg-slate-200 hover:text-slate-800 flex items-center gap-1.5">
            <FileDown className="w-3.5 h-3.5" /> EXPORT DOCX
          </button>
          <button onClick={() => { resetForm(); setIsInputMode(true); }} className="bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all shadow-sm hover:bg-yellow-600 hover:text-white flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> TAMBAH {activeTab === 'prestasi' ? 'PRESTASI' : activeTab === 'beasiswa' ? 'BEASISWA' : 'SISWA TIDAK MAMPU'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 px-4">
        <button 
          onClick={() => setActiveTab('prestasi')}
          className={`flex-1 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'prestasi' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
        >
          <Sparkles className="w-3 h-3 inline-block mr-1" /> Data Prestasi
        </button>
        <button 
          onClick={() => setActiveTab('beasiswa')}
          className={`flex-1 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'beasiswa' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
        >
          <GraduationCap className="w-3 h-3 inline-block mr-1" /> Data Beasiswa
        </button>
        <button 
          onClick={() => setActiveTab('siswa-tidak-mampu')}
          className={`flex-1 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${activeTab === 'siswa-tidak-mampu' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
        >
          <DollarSign className="w-3 h-3 inline-block mr-1" /> Siswa Tidak Mampu
        </button>
      </div>

      {activeTab === 'prestasi' ? (
        <>
          {/* Preview Rekap Prestasi */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white/60 mx-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Preview Rekap Prestasi</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Nama Siswa</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Kelas</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Jenis</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Prestasi</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Tingkat</th>
                  </tr>
                </thead>
                <tbody>
                  {[...achievements].sort((a, b) => {
                    const nameA = students.find(s => s.id === a.studentId)?.name || '';
                    const nameB = students.find(s => s.id === b.studentId)?.name || '';
                    return nameA.localeCompare(nameB);
                  }).map(a => {
                    const student = students.find(s => s.id === a.studentId);
                    return (
                      <tr key={a.id} className="border-b border-slate-200 hover:bg-white/5 transition-colors">
                        <td className="p-2 text-xs font-bold text-slate-800">{student?.name || '-'}</td>
                        <td className="p-2 text-xs text-slate-500">{student?.className || '-'}</td>
                        <td className="p-2 text-xs font-bold text-yellow-500">{a.achievementType}</td>
                        <td className="p-2 text-xs text-slate-600">{a.achievement}</td>
                        <td className="p-2 text-xs text-slate-500 capitalize">{a.level}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4">
            {filteredAchievements.length === 0 ? (
              <div className="col-span-full py-16 text-center glass-card rounded-3xl border border-dashed border-yellow-500/20">
                 <Sparkles className="w-12 h-12 text-yellow-900 mx-auto mb-3 opacity-30" />
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">Belum ada catatan prestasi terdokumentasi.</p>
              </div>
            ) : filteredAchievements.map(a => {
              const student = students.find(s => s.id === a.studentId);
              return (
                <div key={a.id} className="glass-card p-6 rounded-3xl border border-slate-200 bg-white/60 flex flex-col group transition-all hover:border-yellow-500/30">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-yellow-500/20 rounded-lg text-yellow-500 border border-yellow-500/30 shadow-md">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex gap-1.5">
                         <button onClick={() => setPreviewAchievement(a)} title="Lihat Detail" className="p-1.5 bg-white border border-slate-200 hover:bg-yellow-500/10 rounded-lg text-yellow-500 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                         <button onClick={() => startEdit(a)} title="Edit" className="p-1.5 bg-white border border-slate-200 hover:bg-indigo-500/10 rounded-lg text-indigo-400 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                         <button onClick={() => { if(confirm('Hapus catatan prestasi ini?')) onDelete(a.id); }} title="Hapus" className="p-1.5 bg-rose-900/20 border border-rose-500/20 hover:bg-rose-900/40 rounded-lg text-rose-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                   </div>
                   
                   <div className="mb-4">
                      <div className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{student?.name || 'Siswa Dihapus'}</div>
                      <div className="text-[9px] text-yellow-500 font-bold flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3 h-3" /> Kelas {student?.className || '-'}
                      </div>
                   </div>

                   <div className="flex items-center gap-2 mb-3">
                      <div className="text-[10px] font-black text-slate-500">{new Date(a.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</div>
                      <div className="text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        {a.level}
                      </div>
                   </div>

                   <div className="flex-1 space-y-2">
                      <div className="text-xs font-black text-slate-700 uppercase tracking-tight">{a.achievement}</div>
                      <div className="line-clamp-2 text-[10px] text-slate-500 leading-relaxed font-medium italic">"{a.description}"</div>
                   </div>
                </div>
              );
            })}
          </div>
        </>
      ) : activeTab === 'beasiswa' ? (
        <>
          {/* Preview Rekap Beasiswa */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white/60 mx-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Preview Rekap Beasiswa</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Nama Siswa</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Kelas</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Nama Beasiswa</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Tingkat</th>
                  </tr>
                </thead>
                <tbody>
                  {[...scholarships].sort((a, b) => {
                    const nameA = students.find(s => s.id === a.studentId)?.name || '';
                    const nameB = students.find(s => s.id === b.studentId)?.name || '';
                    return nameA.localeCompare(nameB);
                  }).map(s => {
                    const student = students.find(st => st.id === s.studentId);
                    return (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-white/5 transition-colors">
                        <td className="p-2 text-xs font-bold text-slate-800">{student?.name || '-'}</td>
                        <td className="p-2 text-xs text-slate-500">{student?.className || '-'}</td>
                        <td className="p-2 text-xs text-slate-600">{s.scholarshipName}</td>
                        <td className="p-2 text-xs text-slate-500 capitalize">{s.level}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-4">
            {filteredScholarships.length === 0 ? (
              <div className="col-span-full py-16 text-center glass-card rounded-3xl border border-dashed border-yellow-500/20">
                 <GraduationCap className="w-12 h-12 text-yellow-900 mx-auto mb-3 opacity-30" />
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">Belum ada catatan beasiswa terdokumentasi.</p>
              </div>
            ) : filteredScholarships.map(s => {
              const student = students.find(st => st.id === s.studentId);
              return (
                <div key={s.id} className="glass-card p-6 rounded-3xl border border-slate-200 bg-white/60 flex flex-col group transition-all hover:border-yellow-500/30">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-yellow-500/20 rounded-lg text-yellow-500 border border-yellow-500/30 shadow-md">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="flex gap-1.5">
                         <button onClick={() => setPreviewScholarship(s)} title="Lihat Detail" className="p-1.5 bg-white border border-slate-200 hover:bg-yellow-500/10 rounded-lg text-yellow-500 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                         <button onClick={() => startEditScholarship(s)} title="Edit" className="p-1.5 bg-white border border-slate-200 hover:bg-indigo-500/10 rounded-lg text-indigo-400 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                         <button onClick={() => { if(confirm('Hapus catatan beasiswa ini?') && onDeleteScholarship) onDeleteScholarship(s.id); }} title="Hapus" className="p-1.5 bg-rose-900/20 border border-rose-500/20 hover:bg-rose-900/40 rounded-lg text-rose-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                   </div>
                   
                   <div className="mb-4">
                      <div className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{student?.name || 'Siswa Dihapus'}</div>
                      <div className="text-[9px] text-yellow-500 font-bold flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3 h-3" /> Kelas {student?.className || '-'}
                      </div>
                   </div>

                   <div className="flex items-center gap-2 mb-3">
                      <div className="text-[10px] font-black text-slate-500">{new Date(s.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</div>
                      <div className="text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        {s.level}
                      </div>
                   </div>

                   <div className="flex-1 space-y-2">
                      <div className="text-xs font-black text-slate-700 uppercase tracking-tight">{s.scholarshipName}</div>
                      <div className="line-clamp-2 text-[10px] text-slate-500 leading-relaxed font-medium italic">"{s.description}"</div>
                   </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Preview Rekap Siswa Tidak Mampu */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white/60 mx-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Preview Rekap Siswa Tidak Mampu</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Nama Siswa</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Kelas</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Bantuan</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Sumber</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Alamat</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Pekerjaan Ayah</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Pekerjaan Ibu</th>
                    <th className="p-2 text-[9px] font-black uppercase tracking-widest text-slate-500">Catatan Khusus</th>
                  </tr>
                </thead>
                <tbody>
                  {[...economicallyDisadvantagedStudents].sort((a, b) => {
                    const nameA = students.find(s => s.id === a.studentId)?.name || '';
                    const nameB = students.find(s => s.id === b.studentId)?.name || '';
                    return nameA.localeCompare(nameB);
                  }).map(s => {
                    const student = students.find(st => st.id === s.studentId);
                    return (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-white/5 transition-colors">
                        <td className="p-2 text-xs font-bold text-slate-800">{student?.name || '-'}</td>
                        <td className="p-2 text-xs text-slate-500">{student?.className || '-'}</td>
                        <td className="p-2 text-xs font-bold text-yellow-500">{s.assistanceStatus || '-'}</td>
                        <td className="p-2 text-xs text-slate-600">{s.assistanceSource || '-'}</td>
                        <td className="p-2 text-xs text-slate-600">{s.address}</td>
                        <td className="p-2 text-xs text-slate-600">{s.fatherJob}</td>
                        <td className="p-2 text-xs text-slate-600">{s.motherJob}</td>
                        <td className="p-2 text-xs text-slate-600">{s.specialNotes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {previewAchievement && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md" onClick={() => setPreviewAchievement(null)} />
           <div className="relative glass-card w-full max-w-2xl rounded-[4rem] border border-yellow-200 p-12 shadow-3xl bg-white animate-in zoom-in-95 duration-300">
              
              <div className="flex justify-between items-start mb-10">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-yellow-500 rounded-3xl text-white shadow-2xl"><Sparkles className="w-8 h-8" /></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Detail Prestasi</h3>
                       <p className="text-[10px] text-yellow-600 font-black mt-1 uppercase tracking-widest">{new Date(previewAchievement.date).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setPreviewAchievement(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-primary transition-all"><X className="w-5 h-5" /></button>
                 </div>
              </div>

              <div className="space-y-8 h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <label className="label-luxe text-yellow-600">Nama Siswa</label>
                       <div className="text-lg font-black text-slate-900 mt-1">{students.find(s => s.id === previewAchievement.studentId)?.name || 'Siswa Dihapus'}</div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <label className="label-luxe text-yellow-500">Kelas / Tingkat</label>
                       <div className="text-sm font-bold text-slate-700 mt-1">{students.find(s => s.id === previewAchievement.studentId)?.className || '-'} / {previewAchievement.level.toUpperCase()}</div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="label-luxe text-yellow-600">Nama Prestasi / Penghargaan</label>
                    <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100 text-sm text-yellow-900 font-black uppercase tracking-tight">{previewAchievement.achievement}</div>
                 </div>

                 <div className="space-y-3">
                    <label className="label-luxe text-slate-500">Uraian / Keterangan Prestasi</label>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm text-slate-700 italic font-medium leading-relaxed">"{previewAchievement.description}"</div>
                 </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setPreviewAchievement(null)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-black py-6 rounded-3xl transition-all text-xs uppercase tracking-widest shadow-2xl">TUTUP DETAIL</button>
              </div>
           </div>
        </div>
      )}

      {previewScholarship && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md" onClick={() => setPreviewScholarship(null)} />
           <div className="relative glass-card w-full max-w-2xl rounded-[4rem] border border-yellow-200 p-12 shadow-3xl bg-white animate-in zoom-in-95 duration-300">
              
              <div className="flex justify-between items-start mb-10">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-yellow-500 rounded-3xl text-white shadow-2xl"><GraduationCap className="w-8 h-8" /></div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Detail Beasiswa</h3>
                       <p className="text-[10px] text-yellow-600 font-black mt-1 uppercase tracking-widest">{new Date(previewScholarship.date).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setPreviewScholarship(null)} className="p-3 hover:bg-slate-100 rounded-2xl text-primary transition-all"><X className="w-5 h-5" /></button>
                 </div>
              </div>

              <div className="space-y-8 h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <label className="label-luxe text-yellow-600">Nama Siswa</label>
                       <div className="text-lg font-black text-slate-900 mt-1">{students.find(s => s.id === previewScholarship.studentId)?.name || 'Siswa Dihapus'}</div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                       <label className="label-luxe text-yellow-500">Kelas / Tingkat</label>
                       <div className="text-sm font-bold text-slate-700 mt-1">{students.find(s => s.id === previewScholarship.studentId)?.className || '-'} / {previewScholarship.level.toUpperCase()}</div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="label-luxe text-yellow-600">Nama Beasiswa</label>
                    <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100 text-sm text-yellow-900 font-black uppercase tracking-tight">{previewScholarship.scholarshipName}</div>
                 </div>

                 <div className="space-y-3">
                    <label className="label-luxe text-slate-500">Catatan / Keterangan</label>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm text-slate-700 italic font-medium leading-relaxed">"{previewScholarship.description}"</div>
                 </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={() => setPreviewScholarship(null)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-black py-6 rounded-3xl transition-all text-xs uppercase tracking-widest shadow-2xl">TUTUP DETAIL</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AchievementManagement;
