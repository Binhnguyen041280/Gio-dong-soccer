
import React, { useState, useEffect, useRef } from 'react';
import TacticalBoard from './components/TacticalBoard';
import ScenarioControls from './components/ScenarioControls';
import TacticalInfo from './components/TacticalInfo';
import AIGeneratorModal from './components/AIGeneratorModal';
import { SCENARIOS, DEFAULT_MATCH_META, DEFAULT_TEAM_A, DEFAULT_TEAM_B } from './constants';
import { MatchMeta, TeamInfo, PlayerInfo, Scenario, Step, Entity } from './types';
import { Activity, Settings, Gauge, ChevronDown, ChevronUp, Users, Shield, Trophy, MapPin, Calendar, Shirt, Edit3, Save, MoreHorizontal, X, Trash2, Plus, Share2, Download, Upload, Copy, Camera, MonitorPlay, Check, Image as ImageIcon, LayoutTemplate, SquareUser, ZoomIn, ZoomOut, Move, RotateCcw, Palette, ChevronLeft, ChevronRight, SaveAll, UploadCloud, Smartphone, Monitor } from 'lucide-react';

const POSTER_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1920&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1574629810360-7efbbe4384d4?q=80&w=1920&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1920&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1552318965-56d8dc39256a?q=80&w=1920&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1516731237713-fc88062b2e27?q=80&w=1920&auto=format&fit=crop"
];

const APP_STORAGE_KEY = "giodong_soccer_data_v3";

// --- Sub-Components to fix missing name errors ---

const MatchHeader = ({ matchMeta, setMatchMeta, teamA, setTeamA, teamB, setTeamB, isEditMatch, setIsEditMatch, onUploadRequest }: any) => {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg mb-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative group cursor-pointer" onClick={() => onUploadRequest(true)}>
            <img src={teamA.logoUrl} className="w-16 h-16 object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
              <Upload size={16} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            {isEditMatch ? (
              <input 
                value={teamA.name} 
                onChange={(e) => setTeamA({ ...teamA, name: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 w-full text-xl font-black uppercase text-blue-400"
              />
            ) : (
              <h2 className="text-xl font-black uppercase text-blue-400">{teamA.name}</h2>
            )}
            <p className="text-xs text-slate-500 font-bold tracking-widest">{teamA.slogan}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 px-6 border-x border-slate-700">
           {isEditMatch ? (
             <div className="space-y-1">
                <input value={matchMeta.tournament} onChange={e => setMatchMeta({...matchMeta, tournament: e.target.value})} className="bg-slate-700 text-xs text-center border border-slate-600 rounded px-1 w-full" />
                <input value={matchMeta.date} onChange={e => setMatchMeta({...matchMeta, date: e.target.value})} className="bg-slate-700 text-xs text-center border border-slate-600 rounded px-1 w-full" />
             </div>
           ) : (
             <>
               <span className="text-[10px] font-black bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-tighter">{matchMeta.tournament}</span>
               <div className="text-2xl font-black italic opacity-20">VS</div>
               <span className="text-[10px] font-bold text-slate-500">{matchMeta.date}</span>
             </>
           )}
           <button onClick={() => setIsEditMatch(!isEditMatch)} className="text-[10px] font-bold text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4">
              {isEditMatch ? 'Xong' : 'Sửa thông tin'}
           </button>
        </div>

        <div className="flex items-center gap-4 flex-1 flex-row-reverse text-right">
          <div className="relative group cursor-pointer" onClick={() => onUploadRequest(false)}>
            <img src={teamB.logoUrl} className="w-16 h-16 object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
              <Upload size={16} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            {isEditMatch ? (
              <input 
                value={teamB.name} 
                onChange={(e) => setTeamB({ ...teamB, name: e.target.value })}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 w-full text-xl font-black uppercase text-red-400 text-right"
              />
            ) : (
              <h2 className="text-xl font-black uppercase text-red-400">{teamB.name}</h2>
            )}
            <p className="text-xs text-slate-500 font-bold tracking-widest">{teamB.slogan}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerItem = ({ p, teamId, onToggle, onEdit }: any) => {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${p.isStarter ? 'bg-slate-700/50 border-emerald-500/50 shadow-sm' : 'bg-slate-800 border-slate-700'}`}>
       <button 
         onClick={() => onToggle(teamId, p.id)}
         className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${p.isStarter ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-900 border-slate-600'}`}
       >
         {p.isStarter && <Check size={12} className="text-white" />}
       </button>
       <div className={`w-8 h-8 flex items-center justify-center rounded text-sm font-black ${teamId === 'A' ? 'bg-blue-600/20 text-blue-400' : 'bg-red-600/20 text-red-400'}`}>
         {p.number}
       </div>
       <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate text-slate-200">{p.name}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">{p.position} {p.nickname && `• ${p.nickname}`}</div>
       </div>
       <button onClick={() => onEdit(teamId, p)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"><Edit3 size={14} /></button>
    </div>
  );
};

const PlayerEditModal = ({ player, onSave, onDelete, onClose }: { player: PlayerInfo, onSave: (p: PlayerInfo) => void, onDelete: (id: string) => void, onClose: () => void }) => {
  const [edited, setEdited] = useState<PlayerInfo>({ ...player });
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center text-white">
          <h3 className="font-bold">Chỉnh sửa cầu thủ</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
           <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1 space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Số áo</label>
                 <input type="number" value={edited.number} onChange={e => setEdited({...edited, number: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-black" />
              </div>
              <div className="col-span-3 space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Họ và Tên</label>
                 <input value={edited.name} onChange={e => setEdited({...edited, name: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-bold" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Biệt danh</label>
                 <input value={edited.nickname || ''} onChange={e => setEdited({...edited, nickname: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="Nếu có..." />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Vị trí</label>
                 <select value={edited.position} onChange={e => setEdited({...edited, position: e.target.value})} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-bold">
                    <option value="GK">Thủ môn (GK)</option>
                    <option value="FIXO">Thòng (FIXO)</option>
                    <option value="ALA">Cánh (ALA)</option>
                    <option value="PIVO">Đè (PIVO)</option>
                 </select>
              </div>
           </div>
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
           <button onClick={() => { if(window.confirm('Xóa cầu thủ này?')) onDelete(player.id); }} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={18}/></button>
           <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-slate-400 font-bold text-sm">Hủy</button>
              <button onClick={() => onSave(edited)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm">Lưu thay đổi</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ShareModal = ({ dataToExport, onImport, onClose }: { dataToExport: any, onImport: (d: any) => void, onClose: () => void }) => {
  const [jsonStr, setJsonStr] = useState(JSON.stringify(dataToExport, null, 2));
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      onImport(parsed);
      onClose();
    } catch (e) {
      alert("Định dạng JSON không hợp lệ!");
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2"><Share2 size={18} /> Đồng bộ dữ liệu</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
          <p className="text-xs text-slate-400">Sao chép mã bên dưới để chia sẻ hoặc dán mã từ người khác để nhập dữ liệu.</p>
          <textarea 
            value={jsonStr} 
            onChange={(e) => setJsonStr(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 text-[10px] font-mono text-emerald-400 focus:border-emerald-500 outline-none resize-none"
          />
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-all">
            {copySuccess ? <Check size={16} /> : <Copy size={16} />} {copySuccess ? 'Đã chép' : 'Sao chép'}
          </button>
          <button onClick={handleImport} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all">
            <Upload size={16} /> Nhập dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
};

const LogoCropper = ({ imageSrc, onSave, onCancel }: { imageSrc: string, onSave: (data: string) => void, onCancel: () => void }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden w-full max-w-md shadow-2xl">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center text-white">
          <h3 className="font-bold">Xác nhận Logo</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-8 flex flex-col items-center gap-6">
           <div className="w-48 h-48 rounded-2xl bg-slate-900 border border-slate-600 flex items-center justify-center overflow-hidden">
              <img src={imageSrc} className="w-full h-full object-contain" />
           </div>
           <p className="text-xs text-slate-400 text-center">Đảm bảo ảnh logo rõ ràng và có tỉ lệ vuông hoặc tròn để hiển thị tốt nhất.</p>
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
           <button onClick={onCancel} className="px-4 py-2 text-slate-400 font-bold text-sm">Hủy</button>
           <button onClick={() => onSave(imageSrc)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm">Sử dụng ảnh này</button>
        </div>
      </div>
    </div>
  );
};

// --- Presentation View Sub-Components ---

const TeamFormationVisual = ({ team, side, formation }: { team: TeamInfo, side: 'A' | 'B', formation: 'diamond' | 'square' | 'y' }) => {
  const starters = team.players.filter(p => p.isStarter).slice(0, 5);
  const color = side === 'A' ? 'bg-blue-500' : 'bg-red-500';
  
  // Coordinates for 400x300 field mockup
  const pos: Record<string, {x: string, y: string}[]> = {
    diamond: [{x: '50%', y: '85%'}, {x: '50%', y: '60%'}, {x: '20%', y: '45%'}, {x: '80%', y: '45%'}, {x: '50%', y: '15%'}],
    square: [{x: '50%', y: '85%'}, {x: '30%', y: '65%'}, {x: '70%', y: '65%'}, {x: '30%', y: '25%'}, {x: '70%', y: '25%'}],
    y: [{x: '50%', y: '85%'}, {x: '50%', y: '60%'}, {x: '20%', y: '25%'}, {x: '80%', y: '25%'}, {x: '50%', y: '40%'}]
  };

  const coords = pos[formation] || pos.diamond;

  return (
    <div className="relative w-full aspect-[3/4] bg-emerald-900/40 rounded-xl border border-white/10 overflow-hidden shadow-inner">
       <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white rounded-b-full"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white rounded-t-full"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full"></div>
       </div>
       {starters.map((p, i) => (
         <div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-500" style={{ left: coords[i]?.x || '50%', top: coords[i]?.y || '50%' }}>
            <div className={`w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-black text-white ${color} text-lg`}>
               {p.number}
            </div>
            <div className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase backdrop-blur truncate max-w-[80px]">
               {p.nickname || p.name.split(' ').pop()}
            </div>
         </div>
       ))}
    </div>
  );
};

const LineupPresentationView = ({ teamA, teamB, matchMeta, viewMode, onUploadRequest }: any) => {
  const [formationA, setFormationA] = useState<'diamond' | 'square' | 'y'>('diamond');
  const [formationB, setFormationB] = useState<'diamond' | 'square' | 'y'>('diamond');

  const StartersList = ({ team, colorClass }: any) => (
    <div className="flex flex-col gap-3 bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-4 mb-4">
         <img src={team.logoUrl} className="w-16 h-16 object-contain" />
         <div>
            <h2 className="text-2xl font-black text-white uppercase">{team.name}</h2>
            <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">Danh sách chính thức</span>
         </div>
      </div>
      {team.players.filter((p: any) => p.isStarter).map((p: any) => (
        <div key={p.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
           <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 text-white font-black text-xl border border-white/10`}>{p.number}</div>
           <div className="flex-1">
              <div className="text-lg font-bold text-white uppercase">{p.name}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase">{p.position} {p.nickname && `• "${p.nickname}"`}</div>
           </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* View 1: 2 Đội hình chính thức */}
      {viewMode === 'both_list' && (
        <div className="grid grid-cols-2 gap-8">
           <StartersList team={teamA} colorClass="bg-blue-600" />
           <StartersList team={teamB} colorClass="bg-red-600" />
        </div>
      )}

      {/* View 2: Sơ đồ 2 đội */}
      {viewMode === 'both_visual' && (
        <div className="grid grid-cols-2 gap-8 p-8 bg-slate-900/90 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              <div className="text-white text-3xl font-black italic opacity-20">VS</div>
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <img src={teamA.logoUrl} className="w-10 h-10 object-contain" />
                 <h3 className="text-xl font-black text-white uppercase">{teamA.name}</h3>
              </div>
              <TeamFormationVisual team={teamA} side="A" formation={formationA} />
              <div className="flex justify-center gap-2">
                 {['diamond', 'square', 'y'].map(f => (
                   <button key={f} onClick={() => setFormationA(f as any)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${formationA === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{f}</button>
                 ))}
              </div>
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-3 flex-row-reverse">
                 <img src={teamB.logoUrl} className="w-10 h-10 object-contain" />
                 <h3 className="text-xl font-black text-white uppercase">{teamB.name}</h3>
              </div>
              <TeamFormationVisual team={teamB} side="B" formation={formationB} />
              <div className="flex justify-center gap-2">
                 {['diamond', 'square', 'y'].map(f => (
                   <button key={f} onClick={() => setFormationB(f as any)} className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${formationB === f ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{f}</button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* View 3: Sơ đồ từng đội (To) */}
      {(viewMode === 'team_a' || viewMode === 'team_b') && (
        <div className="flex flex-col items-center gap-6 p-10 bg-slate-900 rounded-3xl border border-white/10 shadow-2xl">
           <div className="flex flex-col items-center gap-4">
              <img src={viewMode === 'team_a' ? teamA.logoUrl : teamB.logoUrl} className="w-32 h-32 object-contain" />
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter">
                 {viewMode === 'team_a' ? teamA.name : teamB.name}
              </h1>
              <div className="h-1 w-24 bg-emerald-500 rounded-full"></div>
           </div>
           
           <div className="w-full max-w-md">
              <TeamFormationVisual 
                team={viewMode === 'team_a' ? teamA : teamB} 
                side={viewMode === 'team_a' ? 'A' : 'B'} 
                formation={viewMode === 'team_a' ? formationA : formationB} 
              />
              <div className="flex justify-center gap-4 mt-6">
                 {['diamond', 'square', 'y'].map(f => (
                   <button key={f} onClick={() => viewMode === 'team_a' ? setFormationA(f as any) : setFormationB(f as any)} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${ (viewMode === 'team_a' ? formationA : formationB) === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{f}</button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const MatchPosterView = ({ matchMeta, teamA, teamB, currentBg, orientation, onSelectBg, onUploadBg }: any) => {
  return (
    <div className={`relative flex items-center justify-center bg-black overflow-hidden shadow-2xl transition-all duration-500 ${orientation === 'portrait' ? 'aspect-[9/16] h-[90vh]' : 'aspect-video w-[90vw]'}`}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${currentBg})` }}></div>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        
        <div className={`relative z-10 flex flex-col items-center text-center p-8 w-full h-full justify-center ${orientation === 'portrait' ? 'gap-12' : 'gap-16'}`}>
            <div className="space-y-2">
                <div className="inline-block px-4 py-1 rounded-full border border-emerald-500/50 bg-emerald-900/60 text-emerald-400 font-black uppercase text-[10px] tracking-[0.3em]">
                   {matchMeta.tournament}
                </div>
                <h1 className={`${orientation === 'portrait' ? 'text-6xl' : 'text-8xl'} font-black text-white tracking-tighter leading-none`}>MATCH DAY</h1>
                <p className="text-slate-300 font-bold uppercase tracking-widest text-xs opacity-70">{matchMeta.stadium} • {matchMeta.date.split('-')[0]}</p>
            </div>

            <div className={`flex items-center justify-center w-full ${orientation === 'portrait' ? 'flex-col gap-8' : 'gap-20'}`}>
                <div className="flex flex-col items-center gap-4">
                    <img src={teamA.logoUrl} className={`${orientation === 'portrait' ? 'w-32 h-32' : 'w-48 h-48'} object-contain drop-shadow-2xl`} />
                    <h2 className="text-2xl font-black text-white uppercase">{teamA.shortName || teamA.name}</h2>
                </div>
                <div className={`flex flex-col items-center ${orientation === 'portrait' ? 'rotate-0' : 'rotate-0'}`}>
                    <span className="text-4xl font-black text-white italic opacity-40">VS</span>
                    <div className="mt-2 px-4 py-1 bg-white/10 rounded font-mono font-bold text-emerald-400 border border-white/10">
                       {matchMeta.date.split('-')[1] || '19:00'}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <img src={teamB.logoUrl} className={`${orientation === 'portrait' ? 'w-32 h-32' : 'w-48 h-48'} object-contain drop-shadow-2xl`} />
                    <h2 className="text-2xl font-black text-white uppercase">{teamB.shortName || teamB.name}</h2>
                </div>
            </div>

            <div className="absolute bottom-8 left-0 w-full text-center">
               <p className="text-[10px] text-white/30 font-bold tracking-[0.5em] uppercase">Gió Đông Soccer System</p>
            </div>
        </div>
    </div>
  );
};

// --- App Component ---

const App: React.FC = () => {
  const [savedDataLoaded, setSavedDataLoaded] = useState(false);
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(1);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [status, setStatus] = useState<string>("Sẵn sàng");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isEditMatch, setIsEditMatch] = useState<boolean>(false);
  const [isLineupCollapsed, setIsLineupCollapsed] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  
  // Camera Views
  const [cameraView, setCameraView] = useState<'tactics' | 'lineup' | 'poster'>('tactics');
  const [posterBg, setPosterBg] = useState<string>(POSTER_BACKGROUNDS[0]);
  const [posterOrientation, setPosterOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [lineupViewMode, setLineupViewMode] = useState<'both_list' | 'both_visual' | 'team_a' | 'team_b'>('both_list');

  const [pendingLogoImage, setPendingLogoImage] = useState<string | null>(null);
  const [pendingLogoTeam, setPendingLogoTeam] = useState<'A' | 'B' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterBgInputRef = useRef<HTMLInputElement>(null);

  const [matchMeta, setMatchMeta] = useState<MatchMeta>(DEFAULT_MATCH_META);
  const [teamA, setTeamA] = useState<TeamInfo>(DEFAULT_TEAM_A);
  const [teamB, setTeamB] = useState<TeamInfo>(DEFAULT_TEAM_B);
  const [scenarios, setScenarios] = useState<Record<number, Scenario>>(SCENARIOS);
  const [editingPlayer, setEditingPlayer] = useState<PlayerInfo | null>(null);
  const [editingTeamId, setEditingTeamId] = useState<'A' | 'B' | null>(null);

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

  useEffect(() => {
    if (!savedDataLoaded) return;
    const timer = setTimeout(() => {
      const dataToSave = {
        matchMeta, teamA, teamB, scenarios, posterBg, currentScenarioId
      };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(dataToSave));
    }, 1000);
    return () => clearTimeout(timer);
  }, [matchMeta, teamA, teamB, scenarios, posterBg, currentScenarioId, savedDataLoaded]);

  const getTeamConfig = () => {
    const startersA = teamA.players.filter(p => p.isStarter).slice(0, 5);
    const startersB = teamB.players.filter(p => p.isStarter).slice(0, 5);
    const fmt = (p?: PlayerInfo) => p ? `${p.number} ${p.nickname || p.name.split(' ').pop()}` : '???';
    const fmtInstr = (p?: PlayerInfo) => p ? p.position : '';
    return {
      attack: [
        { name: fmt(startersA[1]), instruction: fmtInstr(startersA[1]) },
        { name: fmt(startersA[2]), instruction: fmtInstr(startersA[2]) },
        { name: fmt(startersA[3]), instruction: fmtInstr(startersA[3]) },
        { name: fmt(startersA[4]), instruction: fmtInstr(startersA[4]) },
        { name: fmt(startersA[0]), instruction: fmtInstr(startersA[0]) },
      ],
      defend: [
        { name: fmt(startersB[1]), instruction: fmtInstr(startersB[1]) },
        { name: fmt(startersB[2]), instruction: fmtInstr(startersB[2]) },
        { name: fmt(startersB[3]), instruction: fmtInstr(startersB[3]) },
        { name: fmt(startersB[4]), instruction: fmtInstr(startersB[4]) },
        { name: fmt(startersB[0]), instruction: fmtInstr(startersB[0]) },
      ]
    };
  };

  const handleScenarioChange = (id: number) => {
    setCurrentScenarioId(id);
    setResetTrigger(prev => prev + 1);
    setIsPlaying(true);
  };
  
  const handleScenarioUpdate = (updatedSteps: Step[]) => {
      setScenarios(prev => ({ ...prev, [currentScenarioId]: { ...prev[currentScenarioId], steps: updatedSteps } }));
  };

  const handleAddScenario = () => {
    const newId = Math.max(...Object.keys(scenarios).map(Number)) + 1;
    const newScenario: Scenario = {
      id: newId, title: "Bài tập mới", desc: "Chưa có mô tả", tacticalAnalysis: [],
      steps: [{ id: 1, title: "Bắt đầu", duration: 0, entities: [{ id: 'P2', type: 'attacker', label: 'P2', x: 100, y: 100 }, { id: 'ball', type: 'ball', label: '', x: 100, y: 100 }] }]
    };
    setScenarios(prev => ({ ...prev, [newId]: newScenario }));
    setCurrentScenarioId(newId);
    setResetTrigger(prev => prev + 1);
  };

  const handleAIGeneratedScenario = (aiData: Partial<Scenario>) => {
    const allIds = Object.keys(scenarios).map(Number);
    const newId = (allIds.length > 0 ? Math.max(...allIds) : 0) + 1;
    const newScenario: Scenario = { id: newId, title: aiData.title || `Bài ${newId} (AI)`, desc: aiData.desc || "Chiến thuật được tạo bởi AI", tacticalAnalysis: aiData.tacticalAnalysis || [], steps: aiData.steps || [] };
    setScenarios(prev => ({ ...prev, [newId]: newScenario }));
    setCurrentScenarioId(newId);
    setResetTrigger(prev => prev + 1);
    setStatus("Sẵn sàng"); setIsPlaying(false);
  };

  const handleReset = () => { setResetTrigger(prev => prev + 1); setIsPlaying(true); };

  const triggerLogoUpload = (isTeamA: boolean) => { setPendingLogoTeam(isTeamA ? 'A' : 'B'); fileInputRef.current?.click(); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => setPendingLogoImage(event.target?.result as string);
      reader.readAsDataURL(file); e.target.value = '';
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 p-2 md:p-6 font-sans ${isPresentationMode ? 'flex flex-col items-center justify-center bg-black' : ''}`}>
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      <input type="file" accept="image/*" ref={posterBgInputRef} className="hidden" onChange={(e) => {
         const f = e.target.files?.[0]; if(!f) return;
         const r = new FileReader(); r.onload = (ev) => ev.target?.result && setPosterBg(ev.target.result as string);
         r.readAsDataURL(f); e.target.value = '';
      }} />

      {editingPlayer && (
        <PlayerEditModal 
          player={editingPlayer} onSave={(p) => {
            const update = editingTeamId === 'A' ? setTeamA : setTeamB;
            update(prev => ({ ...prev, players: prev.players.map(pl => pl.id === p.id ? p : pl) }));
            setEditingPlayer(null);
          }} 
          onDelete={(id) => {
            const update = editingTeamId === 'A' ? setTeamA : setTeamB;
            update(prev => ({ ...prev, players: prev.players.filter(pl => pl.id !== id) }));
            setEditingPlayer(null);
          }}
          onClose={() => setEditingPlayer(null)}
        />
      )}

      {showShareModal && <ShareModal dataToExport={{matchMeta, teamA, teamB, scenarios, currentScenarioId}} onImport={(d: any) => {
          if(d.matchMeta) setMatchMeta(d.matchMeta); if(d.teamA) setTeamA(d.teamA); if(d.teamB) setTeamB(d.teamB);
          if(d.scenarios) setScenarios(d.scenarios); alert("Đã đồng bộ thành công!");
      }} onClose={() => setShowShareModal(false)} />}

      {showAIModal && <AIGeneratorModal onClose={() => setShowAIModal(false)} onGenerate={handleAIGeneratedScenario} />}

      {pendingLogoImage && <LogoCropper imageSrc={pendingLogoImage} onSave={(c: string) => {
          if(pendingLogoTeam === 'A') setTeamA(p => ({...p, logoUrl: c}));
          else setTeamB(p => ({...p, logoUrl: c}));
          setPendingLogoImage(null);
      }} onCancel={() => setPendingLogoImage(null)} />}

      <div className={`${isPresentationMode ? 'w-full h-full flex flex-col items-center justify-center' : 'max-w-6xl mx-auto space-y-4'}`}>
        {!isPresentationMode && (
          <header className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
               <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider border border-slate-700">
                  <Activity size={14} /> Gió đông soccer
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => { setIsPresentationMode(true); setIsControlsVisible(true); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors border border-slate-700"><Camera size={18} /></button>
                   <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg transition-all"><Share2 size={14} /> Đồng bộ Team</button>
                </div>
                <div className="hidden md:block">
                  <ScenarioControls scenarios={scenarios} currentId={currentScenarioId} onSelect={handleScenarioChange} onReset={handleReset} onAdd={handleAddScenario} />
                </div>
          </header>
        )}

        {/* Presentation Controls Overlay */}
        {isPresentationMode && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] flex flex-col items-center gap-2">
             {isControlsVisible ? (
                <div className="flex flex-col gap-2">
                  {/* Secondary Controls for Poster/Lineup */}
                  <div className="flex gap-2 justify-center bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 mb-2">
                      {cameraView === 'poster' && (
                        <>
                          <button onClick={() => setPosterOrientation('landscape')} className={`p-2 rounded-lg ${posterOrientation === 'landscape' ? 'bg-emerald-600' : 'bg-slate-800'}`}><Monitor size={16}/></button>
                          <button onClick={() => setPosterOrientation('portrait')} className={`p-2 rounded-lg ${posterOrientation === 'portrait' ? 'bg-emerald-600' : 'bg-slate-800'}`}><Smartphone size={16}/></button>
                          <div className="w-px bg-white/20 mx-2"></div>
                          <button onClick={() => posterBgInputRef.current?.click()} className="p-2 bg-slate-800 rounded-lg text-white"><UploadCloud size={16}/></button>
                        </>
                      )}
                      {cameraView === 'lineup' && (
                        <div className="flex gap-1">
                          <button onClick={() => setLineupViewMode('both_list')} className={`px-2 py-1 text-[10px] rounded ${lineupViewMode === 'both_list' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Danh sách 2 đội</button>
                          <button onClick={() => setLineupViewMode('both_visual')} className={`px-2 py-1 text-[10px] rounded ${lineupViewMode === 'both_visual' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Sơ đồ 2 đội</button>
                          <button onClick={() => setLineupViewMode('team_a')} className={`px-2 py-1 text-[10px] rounded ${lineupViewMode === 'team_a' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Sơ đồ Đội A</button>
                          <button onClick={() => setLineupViewMode('team_b')} className={`px-2 py-1 text-[10px] rounded ${lineupViewMode === 'team_b' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Sơ đồ Đội B</button>
                        </div>
                      )}
                  </div>

                  <div className="flex items-center gap-4 bg-slate-900/90 p-2 rounded-full border border-slate-700 shadow-2xl backdrop-blur-md">
                      <button onClick={() => setCameraView('tactics')} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${cameraView === 'tactics' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><MonitorPlay size={16} /> Bảng Chiến Thuật</button>
                      <button onClick={() => setCameraView('lineup')} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${cameraView === 'lineup' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><SquareUser size={16} /> Đội Hình</button>
                      <button onClick={() => setCameraView('poster')} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all ${cameraView === 'poster' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><LayoutTemplate size={16} /> Poster</button>
                      <div className="w-px h-6 bg-slate-700 mx-2"></div>
                      <button onClick={() => setIsControlsVisible(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"><ChevronDown size={16} /></button>
                      <button onClick={() => { setIsPresentationMode(false); setCameraView('tactics'); }} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full"><X size={16} /></button>
                  </div>
                </div>
             ) : (
                <button onClick={() => setIsControlsVisible(true)} className="bg-slate-900/50 hover:bg-emerald-600 text-slate-400 hover:text-white p-2 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm transition-all hover:scale-110"><ChevronUp size={24} /></button>
             )}
          </div>
        )}

        {/* --- PRESENTATION VIEWS --- */}

        {isPresentationMode && cameraView === 'poster' && (
           <MatchPosterView 
              matchMeta={matchMeta} teamA={teamA} teamB={teamB} onUploadRequest={triggerLogoUpload} 
              currentBg={posterBg} orientation={posterOrientation} onSelectBg={setPosterBg}
              onUploadBg={() => posterBgInputRef.current?.click()}
            />
        )}

        {isPresentationMode && cameraView === 'lineup' && (
           <LineupPresentationView 
              teamA={teamA} teamB={teamB} matchMeta={matchMeta} 
              viewMode={lineupViewMode} onUploadRequest={triggerLogoUpload} 
           />
        )}

        {isPresentationMode && cameraView === 'tactics' && (
           <div className="flex flex-col items-center gap-6 p-8 bg-slate-900 rounded-3xl border border-white/10 shadow-2xl w-full max-w-5xl">
              <div className="flex justify-between items-center w-full px-4 border-b border-white/10 pb-4">
                 <div className="flex items-center gap-4">
                    <img src={teamA.logoUrl} className="w-12 h-12 object-contain" />
                    <span className="text-xl font-black text-white italic">VS</span>
                    <img src={teamB.logoUrl} className="w-12 h-12 object-contain" />
                 </div>
                 <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tight">{scenarios[currentScenarioId]?.title}</h2>
              </div>
              <div className="w-full flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-3/5">
                      <TacticalBoard 
                         scenario={scenarios[currentScenarioId]} isPlaying={isPlaying} 
                         onPlayStateChange={setIsPlaying} onStatusChange={setStatus} 
                         resetTrigger={resetTrigger} speedMultiplier={speed} 
                         teamConfig={getTeamConfig()} teamNames={{ attack: teamA.name, defend: teamB.name }} 
                         onScenarioUpdate={handleScenarioUpdate} 
                      />
                  </div>
                  <div className="w-full md:w-2/5 space-y-4">
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 h-full">
                          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Phân tích chiến thuật</h4>
                          <div className="space-y-4">
                             {scenarios[currentScenarioId]?.tacticalAnalysis.map((p, i) => (
                               <div key={i} className="flex gap-3 text-sm text-slate-200 leading-relaxed">
                                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black shrink-0 mt-0.5">{i+1}</span>
                                  {p}
                               </div>
                             ))}
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        )}

        {/* --- STANDARD EDITOR VIEW --- */}

        {(!isPresentationMode) && (
           <>
            <MatchHeader 
                matchMeta={matchMeta} setMatchMeta={setMatchMeta} teamA={teamA} setTeamA={setTeamA} teamB={teamB} setTeamB={setTeamB} 
                isEditMatch={isEditMatch} setIsEditMatch={setIsEditMatch} onUploadRequest={triggerLogoUpload} 
            />
            <div className={`grid grid-cols-1 xl:grid-cols-12 gap-6 items-start`}>
                <div className={`transition-all duration-300 ${isLineupCollapsed ? 'xl:col-span-11' : 'xl:col-span-8'} space-y-4`}>
                    <div className="bg-slate-800/80 backdrop-blur rounded-lg p-2 text-center border-l-4 border-emerald-500 shadow-sm flex items-center justify-center min-h-[40px]">
                        <span className="text-emerald-300 font-mono text-sm md:text-base font-bold">{status}</span>
                    </div>
                    <div className="relative">
                        <TacticalBoard scenario={scenarios[currentScenarioId]} isPlaying={isPlaying} onPlayStateChange={setIsPlaying} onStatusChange={setStatus} resetTrigger={resetTrigger} speedMultiplier={speed} teamConfig={getTeamConfig()} teamNames={{ attack: teamA.name, defend: teamB.name }} onScenarioUpdate={handleScenarioUpdate} />
                        <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-b-lg border-x border-b border-slate-700 mx-2">
                            <div className="flex items-center gap-2 text-slate-400 min-w-[80px]"><Gauge size={16} /><span className="text-xs font-bold uppercase">Tốc độ: {speed}x</span></div>
                            <input type="range" min="0.2" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        </div>
                    </div>
                    <TacticalInfo scenario={scenarios[currentScenarioId]} onOpenAI={() => setShowAIModal(true)} />
                </div>

                <div className={`transition-all duration-300 ${isLineupCollapsed ? 'xl:col-span-1' : 'xl:col-span-4'} space-y-4`}>
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col transition-all">
                        <div className={`flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700 ${isLineupCollapsed ? 'flex-col gap-4' : ''}`}>
                            {(!isLineupCollapsed) && (<h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wide whitespace-nowrap"><Shirt size={16} /> Đội Hình</h4>)}
                            <button onClick={() => setIsLineupCollapsed(!isLineupCollapsed)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors">{isLineupCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}</button>
                        </div>
                        {!isLineupCollapsed && (
                          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[600px] animate-in slide-in-from-top-2 fade-in duration-300">
                              <div className="p-4 border-b border-slate-700">
                                   <h5 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center justify-between">
                                      <span className="flex items-center gap-2"><Users size={14} /> {teamA.name}</span>
                                      <span className="text-[10px] bg-blue-900/50 px-2 py-0.5 rounded text-blue-200">{teamA.players.filter(p => p.isStarter).length}/5 Đá chính</span>
                                   </h5>
                                   <div className="space-y-2">
                                      {teamA.players.map(p => (<PlayerItem key={p.id} p={p} teamId="A" onToggle={(t: string, id: string) => {
                                         const update = t === 'A' ? setTeamA : setTeamB;
                                         update(prev => ({ ...prev, players: prev.players.map(pl => pl.id === id ? { ...pl, isStarter: !pl.isStarter } : pl) }));
                                      }} onEdit={(t: 'A'|'B', p: PlayerInfo) => { setEditingTeamId(t); setEditingPlayer(p); }} />))}
                                      <button onClick={() => {
                                        const update = setTeamA;
                                        const newP = { id: Date.now().toString(), name: "Cầu thủ mới", number: 0, position: "ALA", isStarter: false };
                                        update(p => ({ ...p, players: [...p.players, newP] })); setEditingTeamId('A'); setEditingPlayer(newP);
                                      }} className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-500 hover:text-blue-400 text-xs font-bold flex items-center justify-center gap-1 transition-all"><Plus size={14} /> Thêm Cầu Thủ</button>
                                   </div>
                              </div>
                              <div className="p-4">
                                   <h5 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center justify-between">
                                      <span className="flex items-center gap-2"><Shield size={14} /> {teamB.name}</span>
                                      <span className="text-[10px] bg-red-900/50 px-2 py-0.5 rounded text-red-200">{teamB.players.filter(p => p.isStarter).length}/5 Đá chính</span>
                                   </h5>
                                   <div className="space-y-2">
                                      {teamB.players.map(p => (<PlayerItem key={p.id} p={p} teamId="B" onToggle={(t: string, id: string) => {
                                         const update = t === 'A' ? setTeamA : setTeamB;
                                         update(prev => ({ ...prev, players: prev.players.map(pl => pl.id === id ? { ...pl, isStarter: !pl.isStarter } : pl) }));
                                      }} onEdit={(t: 'A'|'B', p: PlayerInfo) => { setEditingTeamId(t); setEditingPlayer(p); }} />))}
                                      <button onClick={() => {
                                        const update = setTeamB;
                                        const newP = { id: Date.now().toString(), name: "Cầu thủ mới", number: 0, position: "ALA", isStarter: false };
                                        update(p => ({ ...p, players: [...p.players, newP] })); setEditingTeamId('B'); setEditingPlayer(newP);
                                      }} className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-500 hover:text-red-400 text-xs font-bold flex items-center justify-center gap-1 transition-all"><Plus size={14} /> Thêm Cầu Thủ</button>
                                   </div>
                              </div>
                          </div>
                        )}
                    </div>
                </div>
            </div>
           </>
        )}
      </div>
    </div>
  );
};

export default App;
