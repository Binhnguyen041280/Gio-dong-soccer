
import React, { useState, useEffect, useRef } from 'react';
import TacticalBoard from './components/TacticalBoard';
import ScenarioControls from './components/ScenarioControls';
import TacticalInfo from './components/TacticalInfo';
import { SCENARIOS, DEFAULT_MATCH_META, DEFAULT_TEAM_A, DEFAULT_TEAM_B } from './constants';
import { MatchMeta, TeamInfo, PlayerInfo, Scenario, Step } from './types';
import { Activity, Settings, Gauge, ChevronDown, ChevronUp, Users, Shield, Trophy, MapPin, Calendar, Shirt, Edit3, Save, MoreHorizontal, X, Trash2, Plus, Share2, Download, Upload, Copy, Camera, MonitorPlay, Check, Image as ImageIcon, LayoutTemplate, SquareUser, ZoomIn, ZoomOut, Move, RotateCcw, Palette, ChevronLeft, ChevronRight, SaveAll } from 'lucide-react';

// --- CONSTANTS FOR POSTER BACKGROUNDS ---
const POSTER_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1920&auto=format&fit=crop", // Sân vận động lớn (Đỏ/Tối)
  "https://images.unsplash.com/photo-1574629810360-7efbbe4384d4?q=80&w=1920&auto=format&fit=crop", // Sân trong nhà (Xanh dương)
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1920&auto=format&fit=crop", // Khán đài
  "https://images.unsplash.com/photo-1552318965-56d8dc39256a?q=80&w=1920&auto=format&fit=crop", // Sân gỗ Futsal focus
  "https://images.unsplash.com/photo-1516731237713-fc88062b2e27?q=80&w=1920&auto=format&fit=crop"  // Sân tối dramatic
];

const APP_STORAGE_KEY = "giodong_soccer_data_v1";

// --- Sub-components defined outside App to prevent focus loss ---

interface PlayerItemProps {
  p: PlayerInfo;
  teamId: 'A' | 'B';
  onToggle: (t: 'A' | 'B', id: string) => void;
  onEdit: (t: 'A' | 'B', p: PlayerInfo) => void;
}

const PlayerItem: React.FC<PlayerItemProps> = ({ p, teamId, onToggle, onEdit }) => (
  <div className={`group flex items-center gap-2 p-2 rounded border transition-all ${p.isStarter ? 'bg-slate-700 border-emerald-500/50 shadow' : 'bg-slate-800/50 border-slate-800 opacity-70 hover:opacity-100'}`}>
      <div 
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900 cursor-pointer ${teamId === 'A' ? 'bg-blue-400' : 'bg-red-400'}`}
        onClick={() => onEdit(teamId, p)}
      >
          {p.number}
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(teamId, p)}>
          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
            {p.name}
            {p.nickname && <span className="text-amber-400 font-normal text-[10px] italic">"{p.nickname}"</span>}
          </div>
          <div className="text-[10px] text-slate-400">{p.position}</div>
      </div>
      
      <button 
          onClick={() => onToggle(teamId, p.id)}
          className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${p.isStarter ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'}`}
      >
          {p.isStarter ? 'Đá Chính' : 'Dự Bị'}
      </button>

      <button 
        onClick={() => onEdit(teamId, p)}
        className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreHorizontal size={14} />
      </button>
  </div>
);

interface PlayerEditModalProps {
  player: PlayerInfo;
  onSave: (p: PlayerInfo) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const PlayerEditModal: React.FC<PlayerEditModalProps> = ({ player, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState<PlayerInfo>({ ...player });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-emerald-400 font-bold flex items-center gap-2">
            <Edit3 size={16} /> Chỉnh Sửa Cầu Thủ
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex gap-4">
             <div className="w-1/3 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Số Áo</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono text-center focus:border-emerald-500 outline-none"
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: parseInt(e.target.value) || 0})}
                />
             </div>
             <div className="w-2/3 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Vị Trí</label>
                <select 
                   className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-emerald-500 outline-none"
                   value={formData.position}
                   onChange={e => setFormData({...formData, position: e.target.value})}
                >
                  <option value="GK">GK (Thủ Môn)</option>
                  <option value="FIXO">FIXO (Thòng)</option>
                  <option value="ALA">ALA (Cánh)</option>
                  <option value="PIVO">PIVO (Tiền đạo)</option>
                </select>
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tên Cầu Thủ</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-emerald-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-amber-400 uppercase">Biệt Danh (Hiển thị trên sân)</label>
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-amber-100 placeholder-slate-600 focus:border-amber-500 outline-none italic"
              value={formData.nickname || ''}
              onChange={e => setFormData({...formData, nickname: e.target.value})}
              placeholder="VD: Trí Hí, Pito..."
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded border border-slate-700 cursor-pointer" onClick={() => setFormData({...formData, isStarter: !formData.isStarter})}>
             <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.isStarter ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                {formData.isStarter && <Save size={12} className="text-white" />}
             </div>
             <span className="text-sm text-slate-300 select-none">Đá chính (Starting 5)</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
            <button 
              onClick={() => onDelete(formData.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
              title="Xóa cầu thủ"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold">Hủy</button>
              <button onClick={() => onSave(formData)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-sm shadow-lg">Lưu</button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Logo Cropper Modal ---

interface LogoCropperProps {
    imageSrc: string;
    onSave: (croppedImage: string) => void;
    onCancel: () => void;
}

const LogoCropper: React.FC<LogoCropperProps> = ({ imageSrc, onSave, onCancel }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const containerSize = 250; // Visual size in pixels
    const outputSize = 300; // Final output size in pixels

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Auto fit on load
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth && naturalHeight) {
            const scaleX = containerSize / naturalWidth;
            const scaleY = containerSize / naturalHeight;
            // Use Math.max to fill the circle (cover), Math.min to fit inside (contain)
            const fitScale = Math.max(scaleX, scaleY); 
            // Default to slightly larger than fit to ensure coverage
            setZoom(fitScale * 1.05);
        }
    };

    const handleSave = () => {
        const canvas = document.createElement('canvas');
        canvas.width = outputSize; 
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');
        if (!ctx || !imgRef.current) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = imgRef.current;
        const scaleFactor = outputSize / containerSize; 
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.translate(position.x * scaleFactor, position.y * scaleFactor);
        const finalScale = zoom * scaleFactor;
        ctx.scale(finalScale, finalScale);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        onSave(canvas.toDataURL('image/png'));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <ImageIcon size={18} className="text-emerald-400"/> Căn Chỉnh Logo
                    </h3>
                    <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>

                <div className="p-6 flex flex-col items-center gap-6">
                    <div className="relative group">
                         {/* Visual Frame */}
                        <div 
                            className="w-[250px] h-[250px] rounded-full border-2 border-emerald-500 overflow-hidden relative cursor-move bg-white/5 shadow-inner flex items-center justify-center"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={(e) => {
                                const touch = e.touches[0];
                                setIsDragging(true);
                                setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
                            }}
                            onTouchMove={(e) => {
                                if(!isDragging) return;
                                const touch = e.touches[0];
                                setPosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
                            }}
                            onTouchEnd={handleMouseUp}
                        >
                            <img 
                                ref={imgRef}
                                src={imageSrc} 
                                alt="Logo Preview"
                                onLoad={handleImageLoad}
                                className="max-w-none absolute top-1/2 left-1/2 origin-center pointer-events-none select-none"
                                style={{ 
                                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})` 
                                }}
                            />
                            
                            <div className="absolute inset-0 pointer-events-none opacity-20 border-white border-2 rounded-full scale-100"></div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded pointer-events-none">
                            <Move size={12} className="inline mr-1"/> Kéo & Thả
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full space-y-4 px-4">
                        <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-bold">
                            <span>Thu nhỏ</span>
                            <span>Phóng to</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <button onClick={() => setZoom(z => Math.max(0.05, z * 0.9))} className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-white"><ZoomOut size={18}/></button>
                             <input 
                                type="range" 
                                min="0.05" 
                                max="5" 
                                step="0.01" 
                                value={zoom} 
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                             />
                             <button onClick={() => setZoom(z => Math.min(5, z * 1.1))} className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-white"><ZoomIn size={18}/></button>
                        </div>
                        
                        <div className="flex justify-center">
                            <button onClick={() => { setZoom(0.5); setPosition({x:0, y:0}); }} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
                                <RotateCcw size={12} /> Reset vị trí
                            </button>
                        </div>
                    </div>

                    <div className="w-full pt-4 border-t border-slate-700 flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm">Hủy</button>
                        <button onClick={handleSave} className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2">
                            <Check size={16}/> Cắt & Sử Dụng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Share / Sync Modal ---

interface ShareModalProps {
  dataToExport: any;
  onImport: (data: any) => void;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ dataToExport, onImport, onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importText, setImportText] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportString = JSON.stringify(dataToExport, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportString);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `futsal-match-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportText = () => {
    try {
      const data = JSON.parse(importText);
      onImport(data);
      onClose();
    } catch (e) {
      alert("Mã dữ liệu không hợp lệ!");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        onImport(data);
        onClose();
      } catch (err) {
        alert("File lỗi hoặc không đúng định dạng!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-emerald-400 font-bold flex items-center gap-2">
            <Share2 size={18} /> Đồng Bộ & Chia Sẻ
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex border-b border-slate-700">
          <button 
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'export' ? 'bg-slate-700 text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            <Download size={16} /> Xuất Dữ Liệu (HLV)
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'import' ? 'bg-slate-700 text-white border-b-2 border-emerald-500' : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            <Upload size={16} /> Nhập Dữ Liệu (Team)
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
           {activeTab === 'export' ? (
             <div className="space-y-4">
                <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg">
                  <h4 className="text-emerald-400 font-bold mb-1 text-sm">Chia sẻ cho đội bóng</h4>
                  <p className="text-xs text-slate-300">Gửi file này cho các thành viên để đồng bộ thông tin trận đấu, đội hình và chiến thuật.</p>
                </div>
                
                <div className="flex flex-col gap-3">
                   <button onClick={handleCopy} className="flex items-center justify-center gap-2 w-full py-3 bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 text-white font-bold transition-all">
                      {copyStatus ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                      {copyStatus ? "Đã sao chép!" : "Sao chép mã cấu hình"}
                   </button>
                   <div className="relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-2 text-slate-500">Hoặc</span></div>
                   </div>
                   <button onClick={handleDownload} className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold shadow-lg transition-all">
                      <Download size={18} /> Tải xuống File (.json)
                   </button>
                </div>
             </div>
           ) : (
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">Dán mã cấu hình vào đây</label>
                 <textarea 
                    className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-3 text-xs font-mono text-slate-300 focus:border-emerald-500 outline-none"
                    placeholder='Paste JSON content here...'
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                 />
                 <button onClick={handleImportText} className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold text-sm">
                   Đồng bộ từ Mã
                 </button>
               </div>

               <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-2 text-slate-500">Hoặc tải file lên</span></div>
               </div>

               <input 
                 type="file" 
                 accept=".json" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileUpload}
               />
               <button 
                 onClick={() => fileInputRef.current?.click()} 
                 className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-emerald-500 hover:bg-slate-700/30 rounded text-slate-400 font-bold flex flex-col items-center justify-center gap-1 transition-all"
               >
                 <Upload size={24} className="mb-1"/>
                 Chọn File .json từ máy
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- View Components for Presentation Mode ---

interface StartingLineupViewProps {
  teamA: TeamInfo;
  teamB: TeamInfo;
  matchMeta: MatchMeta;
  onUploadRequest: (isTeamA: boolean) => void;
}

const StartingLineupView: React.FC<StartingLineupViewProps> = ({ teamA, teamB, matchMeta, onUploadRequest }) => {
  const StartersCard = ({ team, colorClass, side, isTeamA }: { team: TeamInfo, colorClass: string, side: 'left' | 'right', isTeamA: boolean }) => {
     const starters = team.players.filter(p => p.isStarter);
     
     return (
       <div className={`flex flex-col h-full bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl ${side === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
          <div className={`w-full p-6 ${colorClass} bg-opacity-20 flex items-center gap-4 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div 
                className="w-24 h-24 relative group cursor-pointer rounded-full overflow-hidden bg-white/5 border-2 border-white/10 shadow-lg"
                onClick={() => onUploadRequest(isTeamA)}
                title="Bấm để thay đổi Logo"
              >
                   <img src={team.logoUrl} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542564.png')} />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit3 className="text-white" size={24}/>
                   </div>
              </div>
              <div className="flex-1">
                 <h2 className={`text-4xl font-black text-white uppercase tracking-tighter leading-none`}>{team.name}</h2>
                 <p className="text-white/70 text-sm font-bold uppercase tracking-widest mt-1">Starting Lineup</p>
              </div>
          </div>
          
          <div className="flex-1 w-full p-6 space-y-4">
              {starters.map((p, idx) => (
                  <div key={p.id} className={`flex items-center gap-4 p-3 rounded-lg border border-slate-800 bg-slate-800/50 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-12 h-12 flex items-center justify-center rounded-lg text-2xl font-black bg-slate-900 text-white shadow-inner border border-slate-700`}>
                          {p.number}
                      </div>
                      <div className="flex-1">
                          <div className={`text-xl font-bold text-white uppercase ${p.position === 'GK' ? 'text-yellow-400' : ''}`}>
                             {p.name}
                          </div>
                          <div className="flex items-center gap-2 opacity-60">
                             <span className="text-xs font-bold bg-slate-700 px-2 py-0.5 rounded text-slate-300">{p.position}</span>
                             {p.nickname && <span className="text-xs italic text-amber-500">"{p.nickname}"</span>}
                          </div>
                      </div>
                  </div>
              ))}
              {starters.length < 5 && (
                 <div className="p-4 text-center text-slate-500 italic text-sm border border-dashed border-slate-800 rounded">
                    Chưa đủ 5 cầu thủ đá chính
                 </div>
              )}
          </div>
          <div className="w-full p-4 bg-black/40 text-xs text-slate-500 uppercase font-bold tracking-wider text-center border-t border-slate-800">
             {matchMeta.tournament} • {matchMeta.stadium}
          </div>
       </div>
     );
  }

  return (
    <div className="w-full grid grid-cols-2 gap-8 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 h-full min-h-[600px]">
       <StartersCard team={teamA} colorClass="bg-blue-600" side="left" isTeamA={true} />
       <StartersCard team={teamB} colorClass="bg-red-600" side="right" isTeamA={false} />
    </div>
  )
}

const MatchPosterView: React.FC<{ 
    matchMeta: MatchMeta, 
    teamA: TeamInfo, 
    teamB: TeamInfo, 
    onUploadRequest: (isTeamA: boolean) => void,
    currentBg: string,
    onSelectBg: (url: string) => void
}> = ({ matchMeta, teamA, teamB, onUploadRequest, currentBg, onSelectBg }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
      // Full screen overlay with z-index to sit on top of everything
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden p-2 md:p-6">
           
           {/* Floating Toggle Button */}
           <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`absolute left-4 top-4 z-50 p-2 rounded-full bg-slate-800/80 hover:bg-emerald-600 text-white border border-slate-600 shadow-lg transition-all ${isSidebarOpen ? 'bg-emerald-600' : ''}`}
              title={isSidebarOpen ? "Ẩn danh sách nền" : "Hiện danh sách nền"}
           >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <Palette size={20} />}
           </button>
  
           {/* Collapsible Sidebar */}
           <div 
              className={`absolute left-4 top-16 bottom-4 w-20 flex flex-col gap-3 p-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-700 shadow-2xl transition-all duration-300 z-40 overflow-y-auto custom-scrollbar
                ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[200%] opacity-0 pointer-events-none'}
              `}
           >
               <div className="text-[10px] text-emerald-400 font-black uppercase text-center tracking-wider pb-2 border-b border-slate-700 mb-1">
                  Nền
               </div>
               {POSTER_BACKGROUNDS.map((url, idx) => (
                   <div 
                      key={idx} 
                      className={`w-full aspect-square rounded-lg cursor-pointer overflow-hidden border-2 transition-all hover:scale-105 shadow-md ${currentBg === url ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-slate-600 opacity-60 hover:opacity-100'}`}
                      onClick={() => onSelectBg(url)}
                      title={`Nền ${idx + 1}`}
                   >
                       <img src={url} className="w-full h-full object-cover" alt="bg-thumb"/>
                   </div>
               ))}
           </div>
  
          {/* Main Content Area - Centered and Aspect Ratio Preserved */}
          <div className="relative w-full h-full flex items-center justify-center transition-all duration-300">
              <div className={`relative aspect-video w-full max-w-7xl max-h-full rounded-xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden bg-slate-900 transition-all ${isSidebarOpen ? 'ml-24' : ''}`}>
                  {/* Background Image Layer */}
                  <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700" 
                      style={{ backgroundImage: `url(${currentBg})` }}
                  ></div>
                  
                  {/* Overlay Layer for Text Readability */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
      
                  {/* Content */}
                  <div className="relative z-10 space-y-4 md:space-y-8 w-full p-4 md:p-10 scale-90 md:scale-100 origin-center">
                      <div className="space-y-2">
                      <div className="inline-block px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-emerald-500/30 bg-emerald-900/60 backdrop-blur text-emerald-400 font-bold uppercase tracking-widest text-xs md:text-sm mb-2 md:mb-4">
                          {matchMeta.tournament}
                      </div>
                      <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-none opacity-90 drop-shadow-2xl">MATCH DAY</h1>
                      <p className="text-slate-300 font-mono uppercase tracking-widest drop-shadow-md text-xs md:text-base">{matchMeta.round} • {matchMeta.stadium}</p>
                      </div>
      
                      <div className="flex items-center justify-center gap-6 md:gap-24">
                          <div className="flex flex-col items-center gap-2 md:gap-4">
                              {/* Team A Logo Clickable */}
                              <div 
                                  className="w-24 h-24 md:w-56 md:h-56 bg-white/5 rounded-full shadow-2xl flex items-center justify-center overflow-hidden relative group cursor-pointer border-4 border-white/10"
                                  onClick={() => onUploadRequest(true)}
                                  title="Bấm để thay đổi logo"
                              >
                                  <img src={teamA.logoUrl} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542564.png')} />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <span className="text-white font-bold flex items-center gap-2 border border-white/50 px-3 py-1 rounded-full text-xs md:text-base"><Edit3 size={14}/> Sửa</span>
                                  </div>
                              </div>
                              <h2 className="text-xl md:text-4xl font-bold text-white uppercase drop-shadow-lg max-w-[120px] md:max-w-xs truncate">{teamA.shortName || teamA.name}</h2>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center">
                              <span className="text-4xl md:text-6xl font-black text-white italic drop-shadow-2xl">VS</span>
                              <div className="mt-2 md:mt-4 px-3 py-1 md:px-4 md:py-2 bg-slate-900/80 border border-slate-500 rounded text-sm md:text-xl font-bold text-emerald-400 backdrop-blur whitespace-nowrap">
                                  {matchMeta.date.split('-')[1]?.trim() || '19:00'}
                              </div>
                              <div className="mt-1 text-slate-300 text-xs md:text-sm font-bold drop-shadow whitespace-nowrap">
                                  {matchMeta.date.split('-')[0]?.trim()}
                              </div>
                          </div>
      
                          <div className="flex flex-col items-center gap-2 md:gap-4">
                              {/* Team B Logo Clickable */}
                              <div 
                                  className="w-24 h-24 md:w-56 md:h-56 bg-white/5 rounded-full shadow-2xl flex items-center justify-center overflow-hidden relative group cursor-pointer border-4 border-white/10"
                                  onClick={() => onUploadRequest(false)}
                                  title="Bấm để thay đổi logo"
                              >
                                  <img src={teamB.logoUrl} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542564.png')} />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <span className="text-white font-bold flex items-center gap-2 border border-white/50 px-3 py-1 rounded-full text-xs md:text-base"><Edit3 size={14}/> Sửa</span>
                                  </div>
                              </div>
                              <h2 className="text-xl md:text-4xl font-bold text-white uppercase drop-shadow-lg max-w-[120px] md:max-w-xs truncate">{teamB.shortName || teamB.name}</h2>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
};

interface MatchHeaderProps {
  matchMeta: MatchMeta;
  setMatchMeta: (meta: MatchMeta) => void;
  teamA: TeamInfo;
  setTeamA: (team: TeamInfo) => void;
  teamB: TeamInfo;
  setTeamB: (team: TeamInfo) => void;
  isEditMatch: boolean;
  setIsEditMatch: (isEdit: boolean) => void;
  isPresentationMode: boolean;
  onUploadRequest: (isTeamA: boolean) => void;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({ 
  matchMeta, setMatchMeta, 
  teamA, setTeamA, 
  teamB, setTeamB, 
  isEditMatch, setIsEditMatch,
  isPresentationMode,
  onUploadRequest
}) => {
  return (
    <div className={`bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl mb-6 relative group transition-all duration-500 ${isPresentationMode ? 'scale-[1.02] mb-10 border-0 ring-4 ring-slate-900' : ''}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90 z-0"></div>
      
      {/* Edit Trigger - Hidden in Presentation Mode */}
      {!isPresentationMode && (
        <button 
          onClick={() => setIsEditMatch(!isEditMatch)}
          className="absolute top-2 right-2 z-20 p-2 bg-black/30 hover:bg-emerald-600 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <Edit3 size={16}/>
        </button>
      )}

      {isEditMatch && !isPresentationMode ? (
        <div className="relative z-10 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
            {/* Match Meta Edit */}
            <div className="space-y-3 border-r border-slate-700 pr-4">
                <h4 className="text-emerald-400 font-bold uppercase text-xs">Thông tin Trận Đấu</h4>
                <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={matchMeta.tournament} onChange={e => setMatchMeta({...matchMeta, tournament: e.target.value})} placeholder="Tên Giải" />
                <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={matchMeta.stadium} onChange={e => setMatchMeta({...matchMeta, stadium: e.target.value})} placeholder="Sân Vận Động" />
                <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={matchMeta.date} onChange={e => setMatchMeta({...matchMeta, date: e.target.value})} placeholder="Thời Gian" />
            </div>
            {/* Team A Edit */}
            <div className="space-y-3">
                <h4 className="text-blue-400 font-bold uppercase text-xs">Đội Nhà (Attack)</h4>
                <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={teamA.name} onChange={e => setTeamA({...teamA, name: e.target.value})} placeholder="Tên Đội" />
                <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={teamA.slogan} onChange={e => setTeamA({...teamA, slogan: e.target.value})} placeholder="Khẩu Hiệu" />
                
                <div className="flex items-center gap-3">
                   {/* Mini Preview Clickable */}
                   <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden cursor-pointer border border-slate-500 hover:border-emerald-500" onClick={() => onUploadRequest(true)}>
                      <img src={teamA.logoUrl} className="w-full h-full object-cover" />
                   </div>
                   <button onClick={() => onUploadRequest(true)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded text-white text-xs font-bold flex items-center justify-center gap-1" title="Upload Logo">
                      <ImageIcon size={14} /> Chọn Logo
                   </button>
                </div>
            </div>
            {/* Team B Edit */}
            <div className="space-y-3">
                <h4 className="text-red-400 font-bold uppercase text-xs">Đội Khách (Defend)</h4>
                <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={teamB.name} onChange={e => setTeamB({...teamB, name: e.target.value})} placeholder="Tên Đội" />
                <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white" value={teamB.slogan} onChange={e => setTeamB({...teamB, slogan: e.target.value})} placeholder="Khẩu Hiệu" />
                
                <div className="flex items-center gap-3">
                   {/* Mini Preview Clickable */}
                   <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden cursor-pointer border border-slate-500 hover:border-emerald-500" onClick={() => onUploadRequest(false)}>
                      <img src={teamB.logoUrl} className="w-full h-full object-cover" />
                   </div>
                   <button onClick={() => onUploadRequest(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded text-white text-xs font-bold flex items-center justify-center gap-1" title="Upload Logo">
                      <ImageIcon size={14} /> Chọn Logo
                   </button>
                </div>
            </div>
            <button onClick={() => setIsEditMatch(false)} className="col-span-full mt-2 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 font-bold flex justify-center items-center gap-2">
                <Save size={16} /> Hoàn Tất
            </button>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 gap-6">
          {/* Team A */}
          <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right">
              <div 
                  className="w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full mb-2 shadow-lg flex items-center justify-center overflow-hidden cursor-pointer group relative border-2 border-white/10"
                  onClick={() => onUploadRequest(true)}
              >
                  <img src={teamA.logoUrl} alt={teamA.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542564.png')} />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit3 size={20} className="text-white"/>
                   </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">{teamA.name}</h2>
              <p className="text-blue-400 text-xs font-bold tracking-widest">{teamA.slogan}</p>
          </div>

          {/* Match Info Center */}
          <div className="flex-0 flex flex-col items-center justify-center min-w-[200px] space-y-2">
              <div className="bg-slate-900/80 px-4 py-1 rounded-full border border-slate-700 flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="text-xs font-bold text-slate-300 uppercase">{matchMeta.tournament}</span>
              </div>
              <div className="text-4xl font-black text-white font-mono tracking-tighter flex items-center gap-4">
                  <span className="text-slate-500">VS</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase">
                      <Calendar size={12} /> {matchMeta.date}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase">
                      <MapPin size={12} /> {matchMeta.stadium}
                  </div>
              </div>
          </div>

          {/* Team B */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div 
                  className="w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full mb-2 shadow-lg flex items-center justify-center overflow-hidden cursor-pointer group relative border-2 border-white/10"
                  onClick={() => onUploadRequest(false)}
              >
                  <img src={teamB.logoUrl} alt={teamB.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542564.png')} />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Edit3 size={20} className="text-white"/>
                   </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">{teamB.name}</h2>
              <p className="text-red-400 text-xs font-bold tracking-widest">{teamB.slogan}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const App: React.FC = () => {
  // --- LOAD FROM LOCAL STORAGE (Auto Restore) ---
  const [savedDataLoaded, setSavedDataLoaded] = useState(false);
  
  // Initialize state with default values initially
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(1);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [status, setStatus] = useState<string>("Sẵn sàng");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isEditMatch, setIsEditMatch] = useState<boolean>(false);
  const [isLineupCollapsed, setIsLineupCollapsed] = useState<boolean>(false);
  
  // New States for Share/Presentation
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<'tactics' | 'lineup' | 'poster'>('tactics');
  const [posterBg, setPosterBg] = useState<string>(POSTER_BACKGROUNDS[0]);

  // States for Logo Cropper
  const [pendingLogoImage, setPendingLogoImage] = useState<string | null>(null);
  const [pendingLogoTeam, setPendingLogoTeam] = useState<'A' | 'B' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rich Team & Match Data
  const [matchMeta, setMatchMeta] = useState<MatchMeta>(DEFAULT_MATCH_META);
  const [teamA, setTeamA] = useState<TeamInfo>(DEFAULT_TEAM_A);
  const [teamB, setTeamB] = useState<TeamInfo>(DEFAULT_TEAM_B);
  
  // Scenarios State (Mutable)
  const [scenarios, setScenarios] = useState<Record<number, Scenario>>(SCENARIOS);

  // Player Editing State
  const [editingPlayer, setEditingPlayer] = useState<PlayerInfo | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<'A' | 'B' | null>(null);

  // --- EFFECT: RESTORE DATA ON MOUNT ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem(APP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.matchMeta) setMatchMeta(parsed.matchMeta);
        if (parsed.teamA) setTeamA(parsed.teamA);
        if (parsed.teamB) setTeamB(parsed.teamB);
        if (parsed.scenarios) setScenarios(parsed.scenarios);
        if (parsed.posterBg) setPosterBg(parsed.posterBg);
        if (parsed.currentScenarioId) setCurrentScenarioId(parsed.currentScenarioId);
      }
    } catch (error) {
      console.error("Failed to load saved data", error);
    } finally {
      setSavedDataLoaded(true);
    }
  }, []);

  // --- EFFECT: AUTO SAVE ON CHANGE ---
  useEffect(() => {
    if (!savedDataLoaded) return; // Don't save before initial load completes

    const timer = setTimeout(() => {
      const dataToSave = {
        matchMeta,
        teamA,
        teamB,
        scenarios,
        posterBg,
        currentScenarioId
      };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(dataToSave));
    }, 1000); // Debounce 1s

    return () => clearTimeout(timer);
  }, [matchMeta, teamA, teamB, scenarios, posterBg, currentScenarioId, savedDataLoaded]);


  // --- Derived Config for TacticalBoard ---
  const getTeamConfig = () => {
    const startersA = teamA.players.filter(p => p.isStarter).slice(0, 5);
    const startersB = teamB.players.filter(p => p.isStarter).slice(0, 5);
    
    // Logic: Use nickname if available, else last name
    const fmt = (p?: PlayerInfo) => p ? `${p.number} ${p.nickname || p.name.split(' ').pop()}` : '???';
    const fmtInstr = (p?: PlayerInfo) => p ? p.position : '';

    return {
      attack: [
        { name: fmt(startersA[1]), instruction: fmtInstr(startersA[1]) }, // P1
        { name: fmt(startersA[2]), instruction: fmtInstr(startersA[2]) }, // P2
        { name: fmt(startersA[3]), instruction: fmtInstr(startersA[3]) }, // P3
        { name: fmt(startersA[4]), instruction: fmtInstr(startersA[4]) }, // P4
        { name: fmt(startersA[0]), instruction: fmtInstr(startersA[0]) }, // GK
      ],
      defend: [
        { name: fmt(startersB[1]), instruction: fmtInstr(startersB[1]) }, // D1
        { name: fmt(startersB[2]), instruction: fmtInstr(startersB[2]) }, // D2
        { name: fmt(startersB[3]), instruction: fmtInstr(startersB[3]) }, // D3
        { name: fmt(startersB[4]), instruction: fmtInstr(startersB[4]) }, // D4
        { name: fmt(startersB[0]), instruction: fmtInstr(startersB[0]) }, // GK
      ]
    };
  };

  const handleScenarioChange = (id: number) => {
    setCurrentScenarioId(id);
    setResetTrigger(prev => prev + 1);
    setIsPlaying(true);
  };
  
  // Callback when tactical board changes (dragging players)
  const handleScenarioUpdate = (updatedSteps: Step[]) => {
      setScenarios(prev => ({
          ...prev,
          [currentScenarioId]: {
              ...prev[currentScenarioId],
              steps: updatedSteps
          }
      }));
  };

  const handleReset = () => {
    // Optional: If you want 'Reset' to revert to DEFAULT constants, you can do it here. 
    // Currently behaves as "Replay".
    setResetTrigger(prev => prev + 1);
    setIsPlaying(true);
  };

  // Toggle starter status
  const toggleStarter = (team: 'A' | 'B', playerId: string) => {
    const updateTeam = team === 'A' ? setTeamA : setTeamB;
    updateTeam(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, isStarter: !p.isStarter } : p
      )
    }));
  };

  // --- Edit Player Handlers ---
  const openEditPlayer = (teamId: 'A' | 'B', player: PlayerInfo) => {
    setEditingTeamId(teamId);
    setEditingPlayer(player);
  };

  const handleSavePlayer = (updatedPlayer: PlayerInfo) => {
    if (!editingTeamId) return;
    const updateTeam = editingTeamId === 'A' ? setTeamA : setTeamB;
    
    updateTeam(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    }));
    setEditingPlayer(null);
    setEditingTeamId(null);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (!editingTeamId) return;
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa cầu thủ này?");
    if (!confirmDelete) return;

    const updateTeam = editingTeamId === 'A' ? setTeamA : setTeamB;
    updateTeam(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
    setEditingPlayer(null);
    setEditingTeamId(null);
  };

  const handleAddPlayer = (teamId: 'A' | 'B') => {
    const updateTeam = teamId === 'A' ? setTeamA : setTeamB;
    const newPlayer: PlayerInfo = {
      id: Date.now().toString(),
      name: "Cầu thủ mới",
      number: 0,
      position: "ALA",
      isStarter: false
    };
    
    updateTeam(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
    // Auto open edit for new player
    setEditingTeamId(teamId);
    setEditingPlayer(newPlayer);
  };

  // --- Sync Handlers ---
  const handleImportData = (data: any) => {
     if (data.matchMeta) setMatchMeta(data.matchMeta);
     if (data.teamA) setTeamA(data.teamA);
     if (data.teamB) setTeamB(data.teamB);
     if (data.scenarios) setScenarios(data.scenarios);
     if (data.currentScenarioId) handleScenarioChange(data.currentScenarioId);
     alert("Đã đồng bộ dữ liệu trận đấu thành công!");
  };

  // --- Logo Upload & Cropping Logic ---
  const triggerLogoUpload = (isTeamA: boolean) => {
      setPendingLogoTeam(isTeamA ? 'A' : 'B');
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          setPendingLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again if needed
      e.target.value = '';
  };

  const handleSaveCroppedLogo = (croppedImage: string) => {
      if (pendingLogoTeam === 'A') {
          setTeamA(prev => ({ ...prev, logoUrl: croppedImage }));
      } else if (pendingLogoTeam === 'B') {
          setTeamB(prev => ({ ...prev, logoUrl: croppedImage }));
      }
      setPendingLogoImage(null);
      setPendingLogoTeam(null);
  };

  const exportData = {
    matchMeta,
    teamA,
    teamB,
    scenarios,
    currentScenarioId
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 p-2 md:p-6 font-sans ${isPresentationMode ? 'flex flex-col items-center justify-center bg-black' : ''}`}>
      {/* Hidden Global File Input for Logo Upload */}
      <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
      />

      {editingPlayer && (
        <PlayerEditModal 
          player={editingPlayer}
          onSave={handleSavePlayer}
          onDelete={handleDeletePlayer}
          onClose={() => { setEditingPlayer(null); setEditingTeamId(null); }}
        />
      )}

      {showShareModal && (
        <ShareModal 
          dataToExport={exportData}
          onImport={handleImportData}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {pendingLogoImage && (
          <LogoCropper 
              imageSrc={pendingLogoImage}
              onSave={handleSaveCroppedLogo}
              onCancel={() => { setPendingLogoImage(null); setPendingLogoTeam(null); }}
          />
      )}

      <div className={`${isPresentationMode ? 'w-full max-w-5xl' : 'max-w-6xl mx-auto space-y-4'}`}>
        
        {/* Header App Title - Hidden in Presentation Mode */}
        {!isPresentationMode && (
          <header className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
               <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider border border-slate-700">
                  <Activity size={14} />
                  Gió đông soccer
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                      onClick={() => { setIsPresentationMode(true); setIsControlsVisible(true); }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors border border-slate-700"
                      title="Chế độ chụp ảnh / Trình chiếu"
                   >
                      <Camera size={18} />
                   </button>
                   <button 
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg transition-all"
                   >
                      <Share2 size={14} /> Đồng bộ Team
                   </button>
                </div>

                <div className="hidden md:block">
                  <ScenarioControls 
                      currentId={currentScenarioId}
                      onSelect={handleScenarioChange}
                      onReset={handleReset}
                  />
                </div>
          </header>
        )}

        {/* Presentation Mode Exit Button & View Controls */}
        {isPresentationMode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-2">
             
             {isControlsVisible ? (
                <div className="flex items-center gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in">
                    <button 
                        onClick={() => setCameraView('tactics')}
                        className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${cameraView === 'tactics' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <MonitorPlay size={16} /> Bảng Chiến Thuật
                    </button>
                    <button 
                        onClick={() => setCameraView('lineup')}
                        className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${cameraView === 'lineup' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <SquareUser size={16} /> Đội Hình
                    </button>
                    <button 
                        onClick={() => setCameraView('poster')}
                        className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${cameraView === 'poster' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <LayoutTemplate size={16} /> Poster
                    </button>
                    
                    <div className="w-px h-6 bg-slate-700 mx-2"></div>

                    <button 
                        onClick={() => setIsControlsVisible(false)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                        title="Ẩn thanh điều khiển"
                    >
                        <ChevronDown size={16} />
                    </button>

                    <button 
                        onClick={() => { setIsPresentationMode(false); setCameraView('tactics'); }}
                        className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                        title="Thoát chế độ trình chiếu"
                    >
                        <X size={16} />
                    </button>
                </div>
             ) : (
                <button 
                    onClick={() => setIsControlsVisible(true)}
                    className="bg-slate-900/50 hover:bg-emerald-600 text-slate-400 hover:text-white p-2 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm transition-all hover:scale-110"
                    title="Hiện thanh điều khiển"
                >
                    <ChevronUp size={24} />
                </button>
             )}
          </div>
        )}

        {/* --- VIEW: POSTER --- */}
        {isPresentationMode && cameraView === 'poster' && (
           <MatchPosterView 
              matchMeta={matchMeta} 
              teamA={teamA} 
              teamB={teamB} 
              onUploadRequest={triggerLogoUpload} 
              currentBg={posterBg}
              onSelectBg={setPosterBg}
            />
        )}

        {/* --- VIEW: LINEUP --- */}
        {isPresentationMode && cameraView === 'lineup' && (
           <div className="space-y-6">
              <MatchHeader 
                  matchMeta={matchMeta} setMatchMeta={setMatchMeta} teamA={teamA} setTeamA={setTeamA} teamB={teamB} setTeamB={setTeamB}
                  isEditMatch={false} setIsEditMatch={setIsEditMatch} isPresentationMode={true} onUploadRequest={triggerLogoUpload}
              />
              <StartingLineupView teamA={teamA} teamB={teamB} matchMeta={matchMeta} onUploadRequest={triggerLogoUpload} />
           </div>
        )}

        {/* --- VIEW: TACTICS (Standard) --- */}
        {(!isPresentationMode || cameraView === 'tactics') && (
           <>
            {/* Match Presentation Header */}
            <MatchHeader 
                matchMeta={matchMeta}
                setMatchMeta={setMatchMeta}
                teamA={teamA}
                setTeamA={setTeamA}
                teamB={teamB}
                setTeamB={setTeamB}
                isEditMatch={isEditMatch}
                setIsEditMatch={setIsEditMatch}
                isPresentationMode={isPresentationMode}
                onUploadRequest={triggerLogoUpload}
            />

            <div className={`grid grid-cols-1 xl:grid-cols-12 gap-6 items-start ${isPresentationMode ? 'justify-center' : ''}`}>
                
                {/* LEFT: Tactical Board */}
                <div className={`transition-all duration-300 ${isLineupCollapsed || isPresentationMode ? 'xl:col-span-11 mx-auto w-full' : 'xl:col-span-8'} space-y-4`}>
                    {!isPresentationMode && (
                      <div className="bg-slate-800/80 backdrop-blur rounded-lg p-2 text-center border-l-4 border-emerald-500 shadow-sm flex items-center justify-center min-h-[40px]">
                          <span className="text-emerald-300 font-mono text-sm md:text-base font-bold">
                              {status}
                          </span>
                      </div>
                    )}

                    <div className="relative">
                        <TacticalBoard 
                            scenario={scenarios[currentScenarioId]} 
                            isPlaying={isPlaying}
                            onPlayStateChange={setIsPlaying}
                            onStatusChange={setStatus}
                            resetTrigger={resetTrigger}
                            speedMultiplier={speed}
                            teamConfig={getTeamConfig()}
                            teamNames={{ attack: teamA.name, defend: teamB.name }}
                            onScenarioUpdate={handleScenarioUpdate}
                        />
                        
                        {/* Speed Control - Hide in Presentation Mode */}
                        {!isPresentationMode && (
                          <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-b-lg border-x border-b border-slate-700 mx-2">
                              <div className="flex items-center gap-2 text-slate-400 min-w-[80px]">
                                  <Gauge size={16} />
                                  <span className="text-xs font-bold uppercase">Tốc độ: {speed}x</span>
                              </div>
                              <input 
                                  type="range" 
                                  min="0.2" 
                                  max="2.0" 
                                  step="0.1" 
                                  value={speed}
                                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                  className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                              />
                          </div>
                        )}
                    </div>
                    
                    <TacticalInfo scenario={scenarios[currentScenarioId]} />
                </div>

                {/* RIGHT: Team & Lineup Management - Hide in Presentation Mode */}
                {!isPresentationMode && (
                  <div className={`transition-all duration-300 ${isLineupCollapsed ? 'xl:col-span-1' : 'xl:col-span-4'} space-y-4`}>
                      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col transition-all">
                          {/* Sidebar Header with Collapse Toggle */}
                          <div 
                              className={`flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 ${isLineupCollapsed ? 'flex-col gap-4' : ''}`}
                          >
                              {(!isLineupCollapsed) && (
                                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wide whitespace-nowrap">
                                    <Shirt size={16} />
                                    Đội Hình
                                </h4>
                              )}
                              
                              <button 
                                onClick={() => setIsLineupCollapsed(!isLineupCollapsed)}
                                className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors"
                                title={isLineupCollapsed ? "Mở rộng" : "Thu gọn"}
                              >
                                {isLineupCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                              </button>
                          </div>
                          
                          {/* Collapsible Content */}
                          {!isLineupCollapsed && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[600px] animate-in slide-in-from-top-2 fade-in duration-300">
                                {/* Team A Roster */}
                                <div className="p-4 border-b border-slate-700">
                                     <h5 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Users size={14} /> {teamA.name}</span>
                                        <span className="text-[10px] bg-blue-900/50 px-2 py-0.5 rounded text-blue-200">{teamA.players.filter(p => p.isStarter).length}/5 Đá chính</span>
                                     </h5>
                                     <div className="space-y-2">
                                        {teamA.players.map(p => (
                                            <PlayerItem key={p.id} p={p} teamId="A" onToggle={toggleStarter} onEdit={openEditPlayer} />
                                        ))}
                                        <button onClick={() => handleAddPlayer('A')} className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-500 hover:text-blue-400 hover:border-blue-500 hover:bg-slate-800/50 text-xs font-bold flex items-center justify-center gap-1 transition-all">
                                          <Plus size={14} /> Thêm Cầu Thủ
                                        </button>
                                     </div>
                                </div>

                                {/* Team B Roster */}
                                <div className="p-4">
                                     <h5 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Shield size={14} /> {teamB.name}</span>
                                        <span className="text-[10px] bg-red-900/50 px-2 py-0.5 rounded text-red-200">{teamB.players.filter(p => p.isStarter).length}/5 Đá chính</span>
                                     </h5>
                                     <div className="space-y-2">
                                        {teamB.players.map(p => (
                                            <PlayerItem key={p.id} p={p} teamId="B" onToggle={toggleStarter} onEdit={openEditPlayer} />
                                        ))}
                                        <button onClick={() => handleAddPlayer('B')} className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-500 hover:text-red-400 hover:border-red-500 hover:bg-slate-800/50 text-xs font-bold flex items-center justify-center gap-1 transition-all">
                                          <Plus size={14} /> Thêm Cầu Thủ
                                        </button>
                                     </div>
                                </div>
                                
                                <div className="p-3 bg-slate-900/50 text-center border-t border-slate-700">
                                    <p className="text-[10px] text-slate-500 italic">Bấm vào tên hoặc số áo để sửa đổi thông tin</p>
                                </div>
                            </div>
                          )}
                      </div>
                  </div>
                )}
            </div>
           </>
        )}
      </div>
    </div>
  );
};

export default App;
