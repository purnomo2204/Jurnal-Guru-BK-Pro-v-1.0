
import React, { useMemo, useState } from 'react';
import { ViewMode, Student, CounselingLog, TeacherData, CounselingType } from '../types';
import { formatAcademicTitle } from '../src/lib/nameFormatter';
import { 
  ArrowLeft, FileDown, Eye, Search, 
  Calendar, Users, Info, FileText, LayoutGrid, 
  ChevronRight, Filter, Plus, BookOpen, Database, Download,
  Edit, Trash2, X, ExternalLink
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface StrategyReportsProps {
  strategyName: string;
  logs: CounselingLog[];
  students: Student[];
  teacherData: TeacherData;
  setView: (v: ViewMode) => void;
  onAddLog: (initialData: any) => void;
  onEditLog?: (id: string) => void;
  onDeleteLog?: (id: string) => void;
}

const StrategyReports: React.FC<StrategyReportsProps> = ({ 
  strategyName, logs, students, teacherData, setView, onAddLog, onEditLog, onDeleteLog 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('Semua Kelas');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSemester, setReportSemester] = useState('Semua Semester');
  const [reportClass, setReportClass] = useState('Semua Kelas');

  const strategyLogs = useMemo(() => {
    if (strategyName === 'Konsultasi') {
      return logs.filter(l => ['Konsultasi dengan Wali Kelas', 'Konsultasi dengan Guru', 'Konsultasi dengan Orang Tua / Wali'].includes(l.type));
    }
    return logs.filter(l => l.type === strategyName);
  }, [logs, strategyName]);

  const uniqueClasses = useMemo(() => 
    Array.from(new Set(strategyLogs.map(l => l.className))).sort()
  , [strategyLogs]);

  const filteredLogs = useMemo(() => {
    return strategyLogs.filter(l => {
      const matchesSearch = l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (l.topic && l.topic.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesClass = classFilter === 'Semua Kelas' || l.className === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [strategyLogs, searchQuery, classFilter]);

  const reportFilteredLogs = useMemo(() => {
    return strategyLogs.filter(l => {
      const matchesClass = reportClass === 'Semua Kelas' || l.className === reportClass;
      let matchesSemester = true;
      if (reportSemester !== 'Semua Semester') {
        const month = new Date(l.date).getMonth() + 1;
        const semester = (month >= 7 && month <= 12) ? 'Ganjil' : 'Genap';
        matchesSemester = semester === reportSemester;
      }
      return matchesClass && matchesSemester;
    });
  }, [strategyLogs, reportClass, reportSemester]);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `Laporan_${strategyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('print-report-container');
    if (!element) return;

    // Temporarily adjust styles for html2pdf
    const originalStyle = element.style.cssText;
    element.style.display = 'block';
    element.style.width = '100%';
    element.style.backgroundColor = 'white';
    element.style.color = 'black';
    
    const opt = {
      margin:       [20, 20, 20, 20] as [number, number, number, number], // Standard margins (top, left, bottom, right) in mm
      filename:     `Laporan_${strategyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        onclone: (document: Document) => {
          const styles = document.querySelectorAll('style');
          styles.forEach(s => {
            if (s.innerHTML.includes('oklch')) {
              s.innerHTML = s.innerHTML.replace(/oklch\([^)]+\)/g, 'transparent');
            }
          });
        }
      },
      jsPDF:        { unit: 'mm', format: 'legal', orientation: 'portrait' as const }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } finally {
      // Restore original styles
      element.style.cssText = originalStyle;
    }
  };

  const handlePreviewPDF = async () => {
    const element = document.getElementById('print-report-container');
    if (!element) return;

    const originalStyle = element.style.cssText;
    element.style.display = 'block';
    element.style.width = '100%';
    element.style.backgroundColor = 'white';
    element.style.color = 'black';
    
    const opt = {
      margin:       [20, 20, 20, 20] as [number, number, number, number],
      filename:     `Laporan_${strategyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        onclone: (document: Document) => {
          const styles = document.querySelectorAll('style');
          styles.forEach(s => {
            if (s.innerHTML.includes('oklch')) {
              s.innerHTML = s.innerHTML.replace(/oklch\([^)]+\)/g, 'inherit');
            }
          });
        }
      },
      jsPDF:        { unit: 'mm', format: 'legal', orientation: 'portrait' as const }
    };

    try {
      const pdfBlobUrl = await html2pdf().set(opt).from(element).outputPdf('bloburl');
      window.open(pdfBlobUrl, '_blank');
    } finally {
      element.style.cssText = originalStyle;
    }
  };

  const handleInputNew = () => {
    onAddLog({
        type: strategyName === 'Konsultasi' ? 'Konsultasi dengan Wali Kelas' : strategyName,
        academicYear: teacherData.academicYear
    });
  };

  return (
    <div className="space-y-4 animate-fade-in text-left pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 px-2">
        <div className="flex items-center gap-2">
           <button onClick={() => setView(ViewMode.STRATEGY_HUB)} className="p-1.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-all group shadow-sm">
             <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <p className="label-luxe text-primary font-black text-[7px]">ARSIP STRATEGI LAYANAN</p>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">{strategyName}</h2>
           </div>
        </div>
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          <button onClick={handleInputNew} className="bg-primary hover:opacity-90 text-white px-3 py-1.5 rounded-lg font-black text-[8px] flex items-center gap-1.5 shadow-sm transition-all uppercase tracking-widest">
            <Plus className="w-2.5 h-2.5" /> Input Baru
          </button>
          <button onClick={() => setShowReportModal(true)} className="bg-white border border-slate-200 text-primary px-3 py-1.5 rounded-lg font-black text-[8px] flex items-center gap-1.5 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <FileText className="w-2.5 h-2.5" /> Buat Laporan
          </button>
          <button onClick={handleExportJSON} className="bg-white border border-slate-200 text-primary px-3 py-1.5 rounded-lg font-black text-[8px] flex items-center gap-1.5 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Database className="w-2.5 h-2.5" /> Simpan JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 px-2">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary" />
          <input 
            type="text" 
            placeholder="Cari nama siswa atau topik..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-slate-900 outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary" />
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-[10px] text-slate-900 appearance-none outline-none focus:ring-1 focus:ring-primary/20"
          >
            <option value="Semua Kelas">Semua Kelas</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-slate-200 overflow-hidden shadow-sm mx-2 bg-white/90 backdrop-blur-xl">
         <div className="p-2 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tighter italic leading-none">Preview Laporan Layanan</h3>
              <p className="label-luxe text-blue-400 text-[7px] mt-0.5">Daftar Jurnal Harian Strategi: {strategyName}</p>
            </div>
            <div className="flex gap-1.5">
               <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                 <p className="text-[6px] font-black text-blue-400 uppercase tracking-widest mb-0.5 text-center">Total Data</p>
                 <p className="text-sm font-black text-slate-800 text-center leading-none">{filteredLogs.length}</p>
               </div>
            </div>
         </div>
         <div className="overflow-x-auto scroll-hide">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-100/50 text-blue-400 text-[8px] font-black uppercase tracking-widest border-b border-slate-200">
                     <th className="p-2">Waktu & Tanggal</th>
                     <th className="p-2">Sasaran / Siswa</th>
                     <th className="p-2">Uraian / Topik</th>
                     <th className="p-2">Hasil yang Dicapai</th>
                     <th className="p-2 text-right">Aksi</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px] italic">Belum ada catatan untuk strategi ini.</td></tr>
                  ) : filteredLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="p-2">
                          <div className="text-[10px] font-black text-slate-800">{new Date(l.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</div>
                          <div className="text-[8px] text-blue-400 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1 opacity-80">
                            <Calendar className="w-2.5 h-2.5" /> {l.startTime} - {l.endTime}
                          </div>
                       </td>
                       <td className="p-2">
                          <div className="text-xs font-black text-slate-800 group-hover:text-blue-400 transition-colors">{l.studentName}</div>
                          <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-0.5">{l.className}</div>
                       </td>
                       <td className="p-2">
                          <div className="text-[9px] font-black text-slate-600 mb-0.5 uppercase leading-snug">{l.topic || '-'}</div>
                          {l.purpose && <div className="text-[7px] text-blue-400 font-black italic mb-0.5">Tujuan: {l.purpose}</div>}
                          <div className="text-[9px] text-slate-500 font-medium italic leading-relaxed line-clamp-2 max-w-[150px]">{l.result}</div>
                       </td>
                       <td className="p-2">
                          <div className="text-[10px] font-bold text-emerald-500 leading-relaxed max-w-[150px] flex items-start gap-1">
                             <ChevronRight className="w-2.5 h-2.5 shrink-0 mt-0.5 opacity-50" /> {l.followUp}
                          </div>
                       </td>
                       <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {strategyName === 'Konseling Individu' && (
                                <a 
                                  href="https://gemini.google.com/share/12ea11e20054" 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                                  title="Laporan Konseling Individu"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span className="text-[7px] font-black uppercase tracking-tighter">Laporan</span>
                                </a>
                              )}
                             <button onClick={() => onEditLog && onEditLog(l.id)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                               <Edit className="w-3 h-3" />
                             </button>
                             <button onClick={() => { if(window.confirm('Hapus log ini?')) { onDeleteLog && onDeleteLog(l.id); } }} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                               <Trash2 className="w-3 h-3" />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 uppercase tracking-tighter">Buat Laporan</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">Semester</label>
                <select 
                  value={reportSemester}
                  onChange={(e) => setReportSemester(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Semua Semester">Semua Semester</option>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">Kelas</label>
                <select 
                  value={reportClass}
                  onChange={(e) => setReportClass(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowReportModal(false);
                  handlePreviewPDF();
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button 
                onClick={() => {
                  setShowReportModal(false);
                  handleDownloadPDF();
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-colors flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT VERSION - Indonesian Format Standard Kedinasan */}
      <div id="print-report-container" className="hidden text-black bg-white p-0 leading-normal pb-10" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Kop Surat */}
        <div className="flex items-center border-b-[2px] border-black pb-2 mb-4 relative px-2">
          <div className="w-16 shrink-0">
             {teacherData.logoGov && <img src={teacherData.logoGov} className="w-full h-16 object-contain" alt="Logo Pemda" />}
          </div>
          <div className="flex-1 text-center space-y-0.5">
            <h1 className="text-sm font-bold uppercase">{teacherData.govOrFoundation?.trim() || "PEMERINTAH DAERAH"}</h1>
            <h1 className="text-sm font-bold uppercase">{teacherData.deptOrFoundation?.trim() || "DINAS PENDIDIKAN"}</h1>
            <h2 className="text-base font-bold uppercase">{teacherData.school?.trim() || "NAMA SEKOLAH"}</h2>
            <p className="text-[8px] italic">{teacherData.schoolAddress?.trim() || "Alamat Lengkap Sekolah"}</p>
          </div>
          <div className="w-16 shrink-0">
             {teacherData.logoSchool && <img src={teacherData.logoSchool} className="w-full h-16 object-contain" alt="Logo Sekolah" />}
          </div>
        </div>

        {/* Judul Laporan */}
        <div className="text-center space-y-1 mb-4">
           <h3 className="text-base font-bold underline uppercase">LAPORAN KEGIATAN {strategyName.toUpperCase()}</h3>
           <div className="flex justify-center gap-8 text-xs font-bold mt-2 uppercase">
              <div className="flex gap-1"><span>SEMESTER</span><span>:</span><span>{reportSemester === 'Semua Semester' ? '......' : reportSemester}</span></div>
              <div className="flex gap-1"><span>TAHUN AJARAN</span><span>:</span><span>{teacherData.academicYear || "......"}</span></div>
           </div>
           <div className="flex justify-start text-xs font-bold mt-2 ml-2">
              <div className="flex gap-1"><span>KELAS</span><span>:</span><span>{reportClass === 'Semua Kelas' ? '..................' : reportClass}</span></div>
           </div>
        </div>

        {/* Tabel Jurnal Kedinasan */}
        <table className="w-full border-collapse border border-black text-xs">
           <thead>
              <tr className="bg-slate-50">
                 <th className="border border-black p-2 text-center w-8">No</th>
                 <th className="border border-black p-2 text-center w-24">Tanggal</th>
                 <th className="border border-black p-2 text-center w-40">Sasaran (Siswa & Kelas)</th>
                 <th className="border border-black p-2 text-center">Topik / Tujuan / Alasan</th>
                 <th className="border border-black p-2 text-center">Hasil / Evaluasi</th>
                 <th className="border border-black p-2 text-center">Tindak Lanjut</th>
              </tr>
           </thead>
           <tbody>
              {reportFilteredLogs.length === 0 ? (
                Array.from({length: 10}).map((_, i) => (
                  <tr key={i} className="h-10">
                     <td className="border border-black p-1 text-center text-slate-600">{i+1}</td>
                     <td className="border border-black p-1"></td>
                     <td className="border border-black p-1"></td>
                     <td className="border border-black p-1"></td>
                     <td className="border border-black p-1"></td>
                     <td className="border border-black p-1"></td>
                  </tr>
                ))
              ) : reportFilteredLogs.map((l, i) => (
                <tr key={l.id} className="break-inside-avoid">
                   <td className="border border-black p-2 text-center align-top">{i+1}</td>
                   <td className="border border-black p-2 text-center align-top">{new Date(l.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</td>
                   <td className="border border-black p-2 align-top">
                     <div className="font-bold uppercase tracking-tight">{l.studentName}</div>
                     <div className="text-[10px] mt-0.5 font-medium">Kelas: {l.className}</div>
                   </td>
                   <td className="border border-black p-2 align-top">
                     <div className="font-bold mb-0.5 uppercase text-[11px]">{l.topic || l.type}</div>
                     {l.purpose && <div className="text-[10px] font-medium mb-1">Tujuan: {l.purpose}</div>}
                   </td>
                   <td className="border border-black p-2 align-top">
                     <div className="text-[11px] leading-relaxed italic">"{l.result}"</div>
                   </td>
                   <td className="border border-black p-2 align-top">
                     <div className="text-[11px] font-bold leading-relaxed">{l.followUp}</div>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>

        {/* Pengesahan / Tanda Tangan */}
        <div className="mt-16 flex justify-between px-8 leading-relaxed">
           <div className="w-64 text-center space-y-20">
              <div className="space-y-1">
                <p className="text-xs">Mengetahui,</p>
                <p className="text-xs font-medium">Kepala Sekolah</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold underline">{formatAcademicTitle(teacherData.principalName || "NAMA KEPALA SEKOLAH")}</p>
                <p className="text-xs">NIP. {teacherData.principalNip || "..........................."}</p>
              </div>
           </div>
           <div className="w-64 text-center space-y-20">
              <div className="space-y-1">
                <p className="text-xs">{teacherData.city || "Kota"}, {teacherData.approvalDate ? new Date(teacherData.approvalDate).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'}) : "..........................."}</p>
                <p className="text-xs font-medium">Guru Bimbingan dan Konseling</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold underline">{formatAcademicTitle(teacherData.name || "NAMA GURU")}</p>
                <p className="text-xs">NIP. {teacherData.nip || "..........................."}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyReports;
