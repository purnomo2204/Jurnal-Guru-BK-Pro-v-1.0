import React, { useState, useMemo } from 'react';
import { ViewMode, DailyJournal } from '../types';
import { Calendar, Clock, FileText, MapPin, Edit2, Trash2, Plus, Search, Filter, Tag, Eye, X, Info, Users, FileOutput } from 'lucide-react';
import DailyJournalReportModal from './DailyJournalReportModal';

const DailyJournalManagement: React.FC<{
  journals: DailyJournal[];
  setView: (v: ViewMode) => void;
  onDelete: (id: string) => void;
}> = ({ journals, setView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('SEMUA');
  const [classFilter, setClassFilter] = useState<string>('SEMUA');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');
  const [selectedJournal, setSelectedJournal] = useState<DailyJournal | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchesSearch = 
        journal.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.place.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'SEMUA' || journal.activityType === categoryFilter;
      const matchesClass = classFilter === 'SEMUA' || journal.className === classFilter;
      const matchesStatus = statusFilter === 'SEMUA' || journal.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesClass && matchesStatus;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [journals, searchTerm, categoryFilter, classFilter, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">DATA JURNAL HARIAN BK</h2>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Manajemen aktivitas dan tugas harian guru BK</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowReportModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5"
          >
            <FileOutput className="w-3 h-3" /> BUAT LAPORAN
          </button>
          <button 
            onClick={() => setView(ViewMode.DAILY_JOURNAL_INPUT)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3" /> TAMBAH JURNAL
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari kegiatan, deskripsi, atau tempat..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-3 h-3 text-slate-400" />
          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
          >
            <option value="SEMUA">KATEGORI</option>
            <option value="Tugas Pokok">Tugas Pokok</option>
            <option value="Tugas Tambahan">Tugas Tambahan</option>
            <option value="Lain - Lain">Lain - Lain</option>
          </select>
          <select 
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
          >
            <option value="SEMUA">KELAS</option>
            <option value="X">X</option>
            <option value="XI">XI</option>
            <option value="XII">XII</option>
            <option value="X-1">X-1</option>
            <option value="X-2">X-2</option>
            <option value="XI-1">XI-1</option>
            <option value="XI-2">XI-2</option>
            <option value="XII-1">XII-1</option>
            <option value="XII-2">XII-2</option>
          </select>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
          >
            <option value="SEMUA">STATUS</option>
            <option value="Selesai">Selesai</option>
            <option value="Belum Selesai">Belum Selesai</option>
            <option value="Ditunda">Ditunda</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredJournals.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tidak ada jurnal ditemukan</p>
          </div>
        ) : (
          filteredJournals.map(journal => (
            <div key={journal.id} className="glass-card p-3 rounded-xl border border-slate-200 flex justify-between items-start hover:shadow-sm transition-all bg-white/80 backdrop-blur-sm group">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[8px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    <Calendar className="w-2.5 h-2.5 text-blue-500" /> {journal.date} ({journal.day})
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    <Clock className="w-2.5 h-2.5 text-blue-500" /> {journal.time}
                  </span>
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                    journal.activityType === 'Tugas Pokok' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    journal.activityType === 'Tugas Tambahan' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                    'bg-slate-50 text-slate-600 border border-slate-100'
                  }`}>
                    <Tag className="w-2.5 h-2.5" /> {journal.activityType}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{journal.activityName}</h3>
                  <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5 line-clamp-1">{journal.description}</p>
                </div>

                <div className="flex items-center gap-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-rose-500" /> {journal.place}</span>
                  {journal.className && journal.className !== 'SEMUA' && (
                    <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      <Users className="w-2.5 h-2.5 text-blue-500" /> KELAS: {journal.className}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full border ${
                    journal.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    journal.status === 'Belum Selesai' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    journal.status === 'Ditunda' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {journal.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => setSelectedJournal(journal)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Lihat Detail"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Hapus jurnal ini?')) {
                      onDelete(journal.id);
                    }
                  }} 
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedJournal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">DETAIL JURNAL HARIAN</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {selectedJournal.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedJournal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu & Tanggal</p>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>{selectedJournal.date} ({selectedJournal.day})</span>
                    <Clock className="w-4 h-4 text-blue-500 ml-2" />
                    <span>{selectedJournal.time}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Aktivitas</p>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      selectedJournal.activityType === 'Tugas Pokok' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      selectedJournal.activityType === 'Tugas Tambahan' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      'bg-slate-50 text-slate-600 border border-slate-100'
                    }`}>
                      {selectedJournal.activityType}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi / Tempat</p>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{selectedJournal.place}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedJournal.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      selectedJournal.status === 'Belum Selesai' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      selectedJournal.status === 'Ditunda' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {selectedJournal.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Kegiatan</p>
                <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{selectedJournal.activityName}</h4>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Kegiatan</p>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedJournal.description}</p>
                </div>
              </div>

              {selectedJournal.notes && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Tambahan</p>
                  <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 flex gap-3">
                    <Info className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-slate-700 italic leading-relaxed">{selectedJournal.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedJournal(null)}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {showReportModal && (
        <DailyJournalReportModal 
          journals={filteredJournals} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};

export default DailyJournalManagement;
