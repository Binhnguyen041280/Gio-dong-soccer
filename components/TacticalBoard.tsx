
import React, { useRef, useEffect, useState } from 'react';
import { Scenario, Entity, Step } from '../types';
import { Pencil, Save, Plus, Minus, Users, Link, Unlink, MousePointer2, CircleDashed, ArrowRight } from 'lucide-react';

interface PlayerConfig {
    name: string;
    instruction: string;
}

interface TacticalBoardProps {
  scenario: Scenario;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  onStatusChange: (status: string) => void;
  resetTrigger: number;
  speedMultiplier: number;
  teamNames: { attack: string; defend: string };
  teamConfig: { attack: PlayerConfig[]; defend: PlayerConfig[] };
  onScenarioUpdate?: (updatedSteps: Step[]) => void;
}

interface Viewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const TacticalBoard: React.FC<TacticalBoardProps> = ({ 
  scenario, 
  isPlaying, 
  onPlayStateChange,
  onStatusChange, 
  resetTrigger, 
  speedMultiplier,
  teamConfig,
  teamNames,
  onScenarioUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // State
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>(JSON.parse(JSON.stringify(scenario.steps)));
  const [isEditing, setIsEditing] = useState(false);
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  
  // Animation State
  const [animProgress, setAnimProgress] = useState(0);
  const [animStepIndex, setAnimStepIndex] = useState(0);

  // Dragging
  const [draggedEntityId, setDraggedEntityId] = useState<string | null>(null);
  const [isDraggingViewport, setIsDraggingViewport] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Reset when scenario changes, but ONLY if the ID actually changed to avoid overwriting edits during auto-save cycles
  useEffect(() => {
    // Basic deep comparison to avoid unnecessary resets if parent updates reference but content is similar
    const incomingSteps = JSON.stringify(scenario.steps);
    const currentSteps = JSON.stringify(steps);
    
    // Only reset if it's a completely different scenario structure/ID or forced reset
    if (scenario.steps.length !== steps.length || scenario.steps[0].id !== steps[0].id) {
        setSteps(JSON.parse(incomingSteps));
        setActiveStepIndex(0);
        setAnimStepIndex(0);
        setAnimProgress(0);
        setIsEditing(false);
        setSelectedEntityId(null);
        onPlayStateChange(false);
        onStatusChange(`Bước 1: ${scenario.steps[0]?.title || 'Bắt đầu'}`);
    }
  }, [scenario.id, resetTrigger]);

  // --- Helpers ---
  
  // Resolve Entity Label from Team Config
  const getEntityInfo = (ent: Entity) => {
    if (ent.type === 'ball') return { label: '', sub: '' };
    if (ent.type === 'target') return { label: 'ĐÍCH', sub: '' };
    
    // Default mapping IDs to array indices
    // Attack: P1->0, P2->1, P3->2, P4->3, GK_A->4
    // Defend: D1->0, D2->1, D3->2, D4->3, GK_D->4
    
    let configEntry: PlayerConfig | undefined;
    
    if (ent.id === 'P1') configEntry = teamConfig.attack[0];
    else if (ent.id === 'P2') configEntry = teamConfig.attack[1];
    else if (ent.id === 'P3') configEntry = teamConfig.attack[2];
    else if (ent.id === 'P4') configEntry = teamConfig.attack[3];
    else if (ent.id === 'GK_A') configEntry = teamConfig.attack[4];
    
    else if (ent.id === 'D1') configEntry = teamConfig.defend[0];
    else if (ent.id === 'D2') configEntry = teamConfig.defend[1];
    else if (ent.id === 'D3') configEntry = teamConfig.defend[2];
    else if (ent.id === 'D4') configEntry = teamConfig.defend[3];
    else if (ent.id === 'GK_D') configEntry = teamConfig.defend[4];

    if (configEntry && configEntry.name && configEntry.name !== '???') {
        return { label: configEntry.name, sub: configEntry.instruction };
    }
    
    return { label: ent.label, sub: '' };
  };

  // --- Coordinate System Helpers ---
  const getCanvasPoint = (e: React.PointerEvent | { clientX: number, clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const canvasToWorld = (cx: number, cy: number) => {
    return {
      x: (cx - viewport.offsetX) / viewport.scale,
      y: (cy - viewport.offsetY) / viewport.scale
    };
  };

  const getPointerWorldPos = (e: React.PointerEvent) => {
    const cp = getCanvasPoint(e);
    return canvasToWorld(cp.x, cp.y);
  };

  const getInterpolatedEntities = (stepIdx: number, progress: number) => {
    const fromStep = steps[stepIdx];
    const toStep = steps[stepIdx + 1];
    
    if (!toStep) return fromStep.entities;

    return fromStep.entities.map(startEnt => {
      const endEnt = toStep.entities.find(e => e.id === startEnt.id);
      if (!endEnt) return startEnt;
      
      return {
        ...startEnt,
        x: startEnt.x + (endEnt.x - startEnt.x) * progress,
        y: startEnt.y + (endEnt.y - startEnt.y) * progress
      };
    });
  };

  const drawEntities = (ctx: CanvasRenderingContext2D, entities: Entity[], isPreview = false) => {
    entities.forEach(ent => {
        // Draw connection line if grouped
        if (ent.attachedTo && isEditing && !isPreview) {
            const parent = entities.find(e => e.id === ent.attachedTo);
            if (parent) {
                ctx.beginPath();
                ctx.moveTo(ent.x, ent.y);
                ctx.lineTo(parent.x, parent.y);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
                
                const midX = (ent.x + parent.x) / 2;
                const midY = (ent.y + parent.y) / 2;
                ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.arc(midX, midY, 2, 0, Math.PI*2); ctx.fill();
            }
        }

        ctx.save();
        ctx.translate(ent.x, ent.y);
        if (isPreview) ctx.globalAlpha = 0.4;

        // Selection Highlight
        const isSelected = selectedEntityId === ent.id;
        if (isSelected && !isPreview) {
            ctx.beginPath();
            ctx.arc(0, 0, (ent.radius || 10) + 8, 0, Math.PI*2);
            ctx.strokeStyle = "#FACC15"; 
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (isEditing) {
                ctx.beginPath();
                ctx.arc(0, 0, (ent.radius || 10) + 12, 0, Math.PI*2);
                ctx.strokeStyle = "rgba(250, 204, 21, 0.3)";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        if (ent.type === 'ball') {
            ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); 
            ctx.fillStyle = "#fff"; ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fillStyle = "#000"; ctx.fill();
        } else if (ent.type === 'target') {
            ctx.beginPath(); ctx.arc(0, 0, ent.radius || 20, 0, Math.PI*2);
            ctx.fillStyle = isSelected ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 0, 0, 0.15)"; ctx.fill();
            ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; ctx.setLineDash([5, 5]); ctx.stroke();
            ctx.fillStyle = "#fff"; ctx.font = "10px sans-serif"; ctx.fillText("ĐÍCH", 0, 4);
        } else {
            const color = ent.type === 'defender' ? '#EF4444' : (ent.type === 'gk' ? '#10B981' : '#3B82F6');
            
            ctx.beginPath(); ctx.ellipse(0, 6, 7, 2.5, 0, 0, Math.PI*2); 
            ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fill();

            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2);
            ctx.fillStyle = color; ctx.fill();
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
            
            const info = getEntityInfo(ent);
            
            // Name Label
            ctx.fillStyle = "#fff"; 
            ctx.font = "bold 10px sans-serif"; 
            ctx.textAlign = "center";
            ctx.fillText(info.label, 0, -12);

            // Position Sub-label (optional, small below)
            if (info.sub && !isPreview) {
                ctx.fillStyle = "rgba(255,255,255,0.7)";
                ctx.font = "8px sans-serif";
                ctx.fillText(info.sub, 0, 20);
            }
        }
        ctx.restore();
    });
  };

  const drawField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#15803d');
    gradient.addColorStop(1, '#166534');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;

    if (isEditing) {
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.stroke(); }
        for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 2;
    }

    const goalCenter = 200;
    // Goal
    ctx.strokeRect(goalCenter - 30, -5, 60, 10);
    // Area
    ctx.beginPath();
    ctx.arc(goalCenter - 30, 0, 80, 0, Math.PI/2);
    ctx.moveTo(goalCenter - 30, 80); ctx.lineTo(goalCenter + 30, 80);
    ctx.arc(goalCenter + 30, 0, 80, Math.PI/2, Math.PI);
    ctx.stroke();
    // Corner Arc
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI/2); ctx.stroke();
    
    // Team Names on Pitch
    if (!isEditing) {
        ctx.save();
        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.textAlign = "left";
        ctx.fillText(teamNames.attack.toUpperCase(), 10, 280);
        
        ctx.textAlign = "right";
        ctx.fillText(teamNames.defend.toUpperCase(), 390, 280);
        ctx.restore();
    }
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewport.offsetX, viewport.offsetY);
    ctx.scale(viewport.scale, viewport.scale);

    drawField(ctx, 400, 300);

    let entitiesToDraw: Entity[] = [];

    if (isPlaying) {
        const currentStep = steps[animStepIndex];
        const nextStep = steps[animStepIndex + 1];

        if (nextStep) {
             const stepDuration = Math.max(currentStep.duration || 1000, 500) / speedMultiplier; 
             const newProgress = animProgress + (16 / stepDuration);
             
             if (newProgress >= 1) {
                 setAnimProgress(0);
                 setAnimStepIndex(prev => prev + 1);
                 onStatusChange(nextStep.title);
             } else {
                 setAnimProgress(newProgress);
             }
             entitiesToDraw = getInterpolatedEntities(animStepIndex, animProgress);
        } else {
             onPlayStateChange(false);
             entitiesToDraw = steps[steps.length - 1].entities;
             onStatusChange("Kết thúc");
        }
    } else {
        if (isEditing && activeStepIndex > 0) {
             drawEntities(ctx, steps[activeStepIndex - 1].entities, true);
        }
        entitiesToDraw = steps[activeStepIndex].entities;

        if (selectedEntityId && !isPlaying) {
            ctx.beginPath();
            let hasStart = false;
            steps.forEach((s) => {
                const e = s.entities.find(ent => ent.id === selectedEntityId);
                if (e) {
                    if (!hasStart) { ctx.moveTo(e.x, e.y); hasStart = true; }
                    else { ctx.lineTo(e.x, e.y); }
                    ctx.save();
                    ctx.fillStyle = "rgba(250, 204, 21, 0.6)";
                    ctx.fillRect(e.x - 2, e.y - 2, 4, 4);
                    ctx.restore();
                }
            });
            ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    drawEntities(ctx, entitiesToDraw);

    ctx.restore();
    requestRef.current = requestAnimationFrame(() => animate(performance.now()));
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(() => animate(performance.now()));
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isPlaying, steps, activeStepIndex, animStepIndex, animProgress, viewport, isEditing, selectedEntityId, teamConfig]);

  // Handlers
  const handleMouseDown = (e: React.PointerEvent) => {
      e.preventDefault();
      const worldPos = getPointerWorldPos(e);
      setLastMousePos({ x: e.clientX, y: e.clientY });

      if (isEditing) {
          if (selectedEntityId) {
              const selectedEnt = steps[activeStepIndex].entities.find(e => e.id === selectedEntityId);
              if (selectedEnt) {
                   const dist = Math.hypot(selectedEnt.x - worldPos.x, selectedEnt.y - worldPos.y);
                   if (dist < 40) { 
                       setDraggedEntityId(selectedEntityId);
                       return;
                   }
              }
          }

          const hit = [...steps[activeStepIndex].entities].reverse().find(ent => Math.hypot(ent.x - worldPos.x, ent.y - worldPos.y) < (ent.radius || 20));
          if (hit) {
              setDraggedEntityId(hit.id);
              setSelectedEntityId(hit.id);
              return;
          }
      }
      
      setIsDraggingViewport(true);
  };

  const handleMouseMove = (e: React.PointerEvent) => {
      e.preventDefault();
      const dx_client = e.clientX - lastMousePos.x;
      const dy_client = e.clientY - lastMousePos.y;
      setLastMousePos({ x: e.clientX, y: e.clientY });

      if (draggedEntityId && isEditing) {
           const canvas = canvasRef.current;
           if (!canvas) return;
           const rect = canvas.getBoundingClientRect();
           const scaleX = canvas.width / rect.width;
           
           const worldDx = (dx_client * scaleX) / viewport.scale;
           const worldDy = (dy_client * scaleX) / viewport.scale;

          const newSteps = [...steps];

          // === PROPAGATION LOGIC ===
          // Update current step AND all future steps by the same delta
          for (let i = activeStepIndex; i < newSteps.length; i++) {
              const currentEntities = [...newSteps[i].entities];
              const mainEntIndex = currentEntities.findIndex(e => e.id === draggedEntityId);
              
              if (mainEntIndex !== -1) {
                  const mainEnt = currentEntities[mainEntIndex];
                  currentEntities[mainEntIndex] = { ...mainEnt, x: mainEnt.x + worldDx, y: mainEnt.y + worldDy };
              }

              // Update attached entities (Grouping)
              currentEntities.forEach((ent, idx) => {
                  if (ent.attachedTo === draggedEntityId) {
                       currentEntities[idx] = { ...ent, x: ent.x + worldDx, y: ent.y + worldDy };
                  }
              });
              
              newSteps[i] = { ...newSteps[i], entities: currentEntities };
          }

          setSteps(newSteps);

      } else if (isDraggingViewport) {
          setViewport(prev => ({ ...prev, offsetX: prev.offsetX + dx_client, offsetY: prev.offsetY + dy_client }));
      }
  };

  const handleMouseUp = () => {
      if (draggedEntityId && isEditing) {
          // Notify parent of changes when drag ends
          if (onScenarioUpdate) {
              onScenarioUpdate(steps);
          }
      }
      setDraggedEntityId(null);
      setIsDraggingViewport(false);
  };

  const handleZoom = (delta: number) => {
      setViewport(prev => ({ ...prev, scale: Math.max(0.5, Math.min(3, prev.scale + delta)) }));
  };

  const updateRadius = (delta: number) => {
      if (!selectedEntityId || !isEditing) return;
      const currentEntities = [...steps[activeStepIndex].entities];
      const idx = currentEntities.findIndex(e => e.id === selectedEntityId);
      if (idx === -1) return;
      
      const ent = currentEntities[idx];
      if (ent.type !== 'target') return;

      const newRadius = Math.max(10, (ent.radius || 20) + delta);
      currentEntities[idx] = { ...ent, radius: newRadius };
      
      const newSteps = [...steps];
      newSteps[activeStepIndex] = { ...newSteps[activeStepIndex], entities: currentEntities };
      setSteps(newSteps);
      
      // Notify parent
      if (onScenarioUpdate) {
        onScenarioUpdate(newSteps);
      }
  };

  const focusEntity = (id: string) => {
      setSelectedEntityId(id);
      const ent = steps[activeStepIndex].entities.find(e => e.id === id);
      if (ent) {
          setViewport(prev => ({
              ...prev,
              offsetX: 200 - ent.x * prev.scale,
              offsetY: 150 - ent.y * prev.scale
          }));
      }
  };

  const renderEntityButtons = () => {
      const entities = steps[activeStepIndex].entities;
      const attackers = entities.filter(e => e.type === 'attacker' || (e.type === 'gk' && e.id.includes('GK_A')));
      const defenders = entities.filter(e => e.type === 'defender' || (e.type === 'gk' && e.id.includes('GK_D')));
      const objects = entities.filter(e => e.type === 'ball' || e.type === 'target');

      const btnClass = (id: string, colorClass: string) => `
         px-2 py-1.5 rounded text-xs font-bold border transition-all flex items-center justify-center min-w-[36px] shadow-sm
         ${selectedEntityId === id ? 'ring-2 ring-yellow-400 transform scale-105 z-10 brightness-110' : 'opacity-80 hover:opacity-100 hover:scale-105'}
         ${colorClass}
      `;

      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-inner">
              <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {teamNames.attack}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {attackers.map(e => {
                        const info = getEntityInfo(e);
                        return (
                            <button key={e.id} onClick={() => focusEntity(e.id)} className={btnClass(e.id, 'bg-blue-600 border-blue-400 text-white')}>
                                {info.label}
                            </button>
                        );
                    })}
                  </div>
              </div>
              <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> {teamNames.defend}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {defenders.map(e => {
                        const info = getEntityInfo(e);
                        return (
                            <button key={e.id} onClick={() => focusEntity(e.id)} className={btnClass(e.id, 'bg-red-600 border-red-400 text-white')}>
                                {info.label}
                            </button>
                        );
                    })}
                  </div>
              </div>
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> Objects
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {objects.map(e => (
                        <button key={e.id} onClick={() => focusEntity(e.id)} className={btnClass(e.id, 'bg-slate-700 border-slate-500 text-white')}>
                            {e.type === 'ball' ? '⚽' : '🎯'}
                        </button>
                    ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-3">
        <div className="relative border-2 border-slate-600 rounded-lg bg-emerald-900 overflow-hidden select-none aspect-[4/3] touch-none shadow-xl">
            <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className={`w-full h-full ${isEditing ? 'cursor-crosshair' : 'cursor-default'}`}
                onPointerDown={handleMouseDown}
                onPointerMove={handleMouseMove}
                onPointerUp={handleMouseUp}
                onPointerLeave={handleMouseUp}
            />
            
            <div className="absolute top-2 right-2 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto flex flex-col gap-2">
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`p-2.5 rounded-lg shadow-lg font-bold text-xs flex items-center gap-2 transition-all ${isEditing ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'}`}
                    >
                        {isEditing ? <Save size={16} /> : <Pencil size={16} />}
                        {isEditing ? 'LƯU' : 'SỬA'}
                    </button>
                    <div className="bg-slate-800 rounded-lg flex flex-col shadow-lg border border-slate-700 overflow-hidden">
                        <button onClick={() => handleZoom(0.2)} className="p-2 border-b border-slate-700 hover:bg-slate-700 text-white"><Plus size={18}/></button>
                        <button onClick={() => handleZoom(-0.2)} className="p-2 hover:bg-slate-700 text-white"><Minus size={18}/></button>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="absolute top-2 left-2 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-white/10 shadow-sm">
                        Kéo thả cầu thủ • Nhấn vào danh sách để chọn
                    </span>
                </div>
            )}
            
             {isEditing && selectedEntityId && steps[activeStepIndex].entities.find(e => e.id === selectedEntityId)?.type === 'target' && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur px-4 py-2 rounded-full flex items-center gap-3 border border-white/20 shadow-xl pointer-events-auto">
                    <CircleDashed size={16} className="text-white"/>
                    <button onClick={() => updateRadius(-5)} className="text-white hover:text-red-400 p-1"><Minus size={14}/></button>
                    <span className="text-white text-xs font-bold w-8 text-center">Size</span>
                    <button onClick={() => updateRadius(5)} className="text-white hover:text-green-400 p-1"><Plus size={14}/></button>
                </div>
            )}
            
            <button 
                className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/40 backdrop-blur text-white px-2 py-1 rounded hover:bg-black/60 transition-colors pointer-events-auto border border-white/10"
                onClick={() => setViewport({scale: 1, offsetX: 0, offsetY: 0})}
            >
                RESET ZOOM
            </button>
        </div>

        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col gap-3 shadow-lg">
             <div className="flex items-center justify-between gap-4">
                <div className="flex-1 overflow-x-auto custom-scrollbar pb-1">
                    <div className="flex gap-2">
                        {steps.map((step, idx) => (
                            <button
                                key={step.id}
                                onClick={() => {
                                    onPlayStateChange(false);
                                    setActiveStepIndex(idx);
                                    setAnimStepIndex(idx);
                                    onStatusChange(`Bước ${idx+1}: ${step.title}`);
                                }}
                                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                                    activeStepIndex === idx && !isPlaying
                                    ? 'bg-emerald-600 border-emerald-400 text-white shadow' 
                                    : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                                }`}
                            >
                                <span className="opacity-70 text-[10px] uppercase block">Bước {idx + 1}</span>
                                {step.title}
                            </button>
                        ))}
                        {isEditing && (
                            <button 
                                className="px-3 py-2 rounded-lg border border-dashed border-slate-500 text-slate-400 hover:border-emerald-400 hover:text-emerald-400 transition-colors flex flex-col items-center justify-center min-w-[80px]"
                                onClick={() => {
                                    const newStep = JSON.parse(JSON.stringify(steps[steps.length-1]));
                                    newStep.id = steps.length + 1;
                                    newStep.title = "Mới";
                                    setSteps([...steps, newStep]);
                                    setActiveStepIndex(steps.length);
                                    
                                    // Notify parent
                                    if (onScenarioUpdate) {
                                      onScenarioUpdate([...steps, newStep]);
                                    }
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>
                
                <button
                    onClick={() => {
                        if (isPlaying) {
                            onPlayStateChange(false);
                        } else {
                            setAnimStepIndex(0);
                            setAnimProgress(0);
                            onPlayStateChange(true);
                        }
                    }}
                    className={`px-5 py-3 rounded-xl font-bold shadow-lg transition-all whitespace-nowrap flex items-center gap-2 ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'}`}
                >
                    {isPlaying ? 'DỪNG' : <><ArrowRight size={18} /> PHÁT TẤT CẢ</>}
                </button>
            </div>

            {renderEntityButtons()}
        </div>
    </div>
  );
};

export default TacticalBoard;
