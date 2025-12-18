
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Sparkles, Loader2, Play } from 'lucide-react';
import { Scenario, Step, Entity } from '../types';

interface AIGeneratorModalProps {
  onClose: () => void;
  onGenerate: (data: Partial<Scenario>) => void;
}

const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Initialize with correct SDK pattern
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        You are a World-Class Futsal Tactical Coach and Analyst.
        Your task is to generate a precise, JSON-structured tactical scenario based on the user's request.

        --- FIELD COORDINATES SYSTEM ---
        - Canvas Size: 400 (Width) x 300 (Height).
        - Orientation: Vertical.
        - Defending Goal (Opponent): Top center (x: 200, y: 10).
        - Attacking Goal (Home): Bottom center (x: 200, y: 290).
        - Midfield Line: y = 150.
        - Attack Direction: Bottom to Top (Players move from Y=300 towards Y=0).

        --- ENTITIES ---
        - Attackers: P1, P2, P3, P4.
        - Attacking GK: GK_A (Normal pos: 200, 280. Power Play pos: moves up to > 150).
        - Defenders: D1, D2, D3, D4.
        - Defending GK: GK_D (Stays near 200, 20).
        - Ball: ball (Must coordinate with player position).
        - Target: target_finish (Optional, visual marker for shot destination).

        --- TACTICAL LOGIC REQUIREMENTS ---
        1. **POWER PLAY (5v4):** 
           - If the user asks for "Power Play" or "5 cầu", you MUST move **GK_A** up to the opponent's half (e.g., x: 200, y: 140) to act as a playmaker.
           - Attackers (P1-P4) must spread out wide (wing) and deep (corner) to stretch defense.
           - Defenders (D1-D4) must pack tight in a Diamond (1-2-1) or Box (2-2) formation near their goal (y < 100).
        
        2. **CORNER KICK:**
           - Ball and Taker (e.g., P1) must start at (0,0) or (400,0).
           - Need a Blocker inside the box and a Shooter running from outside.

        3. **STEP PROGRESSION (Animation):**
           - **Step 1 (Setup):** duration: 0. Static starting positions.
           - **Step 2 (Action):** duration: 2000. Players ROTATE or RUN. Ball moves if passed.
           - **Step 3 (Finish):** duration: 1500. Final pass and Shot.
           - **Consistency:** Player positions in Step N must logically flow from Step N-1. Do not teleport players randomly.

        --- OUTPUT FORMAT (JSON ONLY) ---
        {
          "title": "Short Tactical Name (e.g., Power Play: 2-1-2)",
          "desc": "2-sentence summary of the objective.",
          "tacticalAnalysis": [
             "Bước 1: [Mô tả cụ thể hành động, ví dụ: GK dâng cao, P2 mở cánh]",
             "Bước 2: [Mô tả di chuyển, ví dụ: P3 chạy cắt mặt, bóng chuyền xuống đáy]",
             "Bước 3: [Mô tả dứt điểm]"
          ],
          "steps": [
             {
               "id": 1,
               "title": "Ổn định đội hình",
               "duration": 0,
               "entities": [ { "id": "P1", "type": "attacker", "label": "P1", "x": 100, "y": 200 }, ... all players ... ]
             },
             {
               "id": 2,
               "title": "Triển khai bóng",
               "duration": 2000,
               "entities": [ ... updated coordinates ... ]
             }
             ... at least 3 steps ...
          ]
        }
      `;

      // Fix: Use 'gemini-3-pro-preview' for complex tactical analysis tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Create a futsal tactic for: ${prompt}. Ensure specific steps for Futsal.`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });

      // Fix: Access .text property directly (not a method)
      const jsonText = response.text;
      if (!jsonText) throw new Error("AI returned empty response");

      const scenarioData = JSON.parse(jsonText);
      onGenerate(scenarioData);
      onClose();

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError("Có lỗi xảy ra khi tạo chiến thuật. Vui lòng thử lại. " + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center gap-2 text-lg">
            <Sparkles className="text-fuchsia-400" size={20}/> 
            AI Trợ Lý Chiến Thuật
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Mô tả tình huống chiến thuật bạn muốn:</label>
            <textarea 
              className="w-full h-32 bg-slate-800 border border-slate-600 rounded-xl p-4 text-white focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 outline-none resize-none placeholder-slate-500"
              placeholder="Ví dụ: Power Play 5 cầu. Thủ môn dâng cao làm tường, P2 và P3 chạy đan chéo dứt điểm cột 2..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-xs">
              {error}
            </div>
          )}
          
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
             <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Gợi ý nhanh:</h4>
             <div className="flex flex-wrap gap-2">
                <button onClick={() => setPrompt("Power Play: Thủ môn dâng cao, đội hình 2-1-2 ép sân.")} className="text-[10px] px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors">Power Play (2-1-2)</button>
                <button onClick={() => setPrompt("Phạt góc cánh phải: Chuyền bổng cho P3 bắt vô lê.")} className="text-[10px] px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors">Phạt góc Vô lê</button>
                <button onClick={() => setPrompt("Thoát Pressing: Pivo làm tường nhả lại cho Ala chạy lên.")} className="text-[10px] px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors">Thoát Pressing</button>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold"
             disabled={isLoading}
           >
             Hủy
           </button>
           <button 
             onClick={handleGenerate}
             disabled={isLoading || !prompt.trim()}
             className={`px-6 py-2 rounded-lg font-bold text-white text-sm shadow-lg flex items-center gap-2 transition-all
               ${isLoading || !prompt.trim() 
                 ? 'bg-slate-600 cursor-not-allowed opacity-50' 
                 : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 hover:scale-105'}
             `}
           >
             {isLoading ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} />}
             {isLoading ? 'Đang thiết kế...' : 'Tạo Chiến Thuật'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratorModal;
