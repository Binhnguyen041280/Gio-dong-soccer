
import { Scenario, Entity, MatchMeta, TeamInfo } from './types';

// Helper to create standard entities for a step
const createEntities = (overrides: Partial<Entity>[] = []): Entity[] => {
  const defaults: Entity[] = [
    // Attackers
    { id: 'P1', type: 'attacker', label: 'P1', x: 5, y: 5 }, // Corner taker
    { id: 'P2', type: 'attacker', label: 'P2', x: 180, y: 60 },
    { id: 'P3', type: 'attacker', label: 'P3', x: 220, y: 180 },
    { id: 'P4', type: 'attacker', label: 'P4', x: 250, y: 100 },
    { id: 'GK_A', type: 'gk', label: 'GK', x: 200, y: 10 },
    
    // Defenders
    { id: 'D1', type: 'defender', label: 'D1', x: 130, y: 20 },
    { id: 'D2', type: 'defender', label: 'D2', x: 170, y: 50 },
    { id: 'D3', type: 'defender', label: 'D3', x: 200, y: 160 },
    { id: 'D4', type: 'defender', label: 'D4', x: 230, y: 90 },
    { id: 'GK_D', type: 'gk', label: 'GK', x: 200, y: 280 }, // Defending GK

    // Ball
    { id: 'ball', type: 'ball', label: '', x: 10, y: 10 },
  ];

  return defaults.map(def => {
    const ovr = overrides.find(o => o.id === def.id);
    return ovr ? { ...def, ...ovr } : def;
  });
};

export const SCENARIOS: Record<number, Scenario> = {
  1: {
    id: 1,
    title: "Bài 1: Cắt Mặt Cột 1",
    desc: "Blocker đứng cột 1. Runner chạy vòng ra sau lưng dứt điểm.",
    tacticalAnalysis: [
      "Bước 1: P2 chiếm vị trí cột 1, D2 theo kèm.",
      "Bước 2: P3 tăng tốc, D3 đuổi theo.",
      "Bước 3: P2 block D1/D3, P3 đệm bóng."
    ],
    steps: [
      {
        id: 1,
        title: "Vị trí ban đầu",
        duration: 0,
        entities: createEntities([
             { id: 'D2', attachedTo: 'P2' }, // D2 marks P2
             { id: 'D3', attachedTo: 'P3' }  // D3 marks P3
        ])
      },
      {
        id: 2,
        title: "Di chuyển không bóng",
        duration: 2000,
        entities: createEntities([
          { id: 'P2', x: 140, y: 30 }, // Blocker moves in
          { id: 'D2', x: 150, y: 40, attachedTo: 'P2' }, // D2 follows
          { id: 'P3', x: 135, y: 100 }, // Runner starts run
          { id: 'D3', x: 150, y: 110, attachedTo: 'P3' },
          { id: 'ball', x: 10, y: 10 } // Ball still at corner
        ])
      },
      {
        id: 3,
        title: "Dứt điểm",
        duration: 1500,
        entities: createEntities([
          { id: 'P2', x: 140, y: 30 },
          { id: 'D2', x: 150, y: 40 },
          { id: 'P3', x: 135, y: 25 }, // Runner arrives
          { id: 'D3', x: 150, y: 45 }, // D3 blocked/late
          { id: 'ball', x: 135, y: 25 }, // Pass arrives
          { id: 'target_finish', type: 'target', label: '', x: 135, y: 25, radius: 30 } as Entity // Visual finish zone
        ])
      }
    ]
  },
  2: {
    id: 2,
    title: "Bài 2: Chéo Cánh (X-Screen)",
    desc: "Hai cầu thủ chạy chéo nhau. Blocker dừng lại cản hậu vệ.",
    tacticalAnalysis: [
        "Bước 1: P2 và P3 đứng rộng.",
        "Bước 2: Cả hai chạy cắt chéo vào trung lộ.",
        "Bước 3: P2 dừng lại block D3, P3 thoát xuống."
    ],
    steps: [
      {
        id: 1,
        title: "Chuẩn bị",
        duration: 0,
        entities: createEntities([
            { id: 'P2', x: 160, y: 100 },
            { id: 'P3', x: 240, y: 100 },
            { id: 'D2', x: 170, y: 90, attachedTo: 'P2' },
            { id: 'D3', x: 230, y: 90, attachedTo: 'P3' }
        ])
      },
      {
        id: 2,
        title: "Cắt chéo (Giao nhau)",
        duration: 1500,
        entities: createEntities([
            { id: 'P2', x: 200, y: 100 }, // Mid point
            { id: 'P3', x: 200, y: 100 }, // Mid point
            { id: 'D2', x: 200, y: 90 },
            { id: 'D3', x: 200, y: 90 }
        ])
      },
      {
        id: 3,
        title: "Thoát xuống",
        duration: 1500,
        entities: createEntities([
            { id: 'P2', x: 240, y: 100 }, // Screen set
            { id: 'P3', x: 160, y: 100 }, // Runner free
            { id: 'D3', x: 220, y: 100 }, // Blocked
            { id: 'ball', x: 160, y: 100 },
            { id: 'target_finish', type: 'target', label: '', x: 160, y: 100, radius: 25 } as Entity
        ])
      }
    ]
  },
  3: {
    id: 3,
    title: "Bài 3: Nhả Tuyến 2",
    desc: "Blocker chạy ra ngoài làm tường. Bóng trả ngược sút xa.",
    tacticalAnalysis: [
        "Bước 1: P2 chạy từ trong ra.",
        "Bước 2: P2 cài đè D2.",
        "Bước 3: P3 băng lên sút."
    ],
    steps: [
      {
        id: 1,
        title: "Vị trí",
        duration: 0,
        entities: createEntities([
            { id: 'P2', x: 180, y: 50 },
            { id: 'P3', x: 200, y: 220 },
            { id: 'D2', x: 190, y: 60, attachedTo: 'P2' }
        ])
      },
      {
        id: 2,
        title: "Làm tường",
        duration: 2000,
        entities: createEntities([
            { id: 'P2', x: 280, y: 120 },
            { id: 'D2', x: 270, y: 110 },
            { id: 'P3', x: 200, y: 180 }, // Start run
            { id: 'ball', x: 10, y: 10 }
        ])
      },
      {
        id: 3,
        title: "Sút xa",
        duration: 1000,
        entities: createEntities([
            { id: 'P2', x: 280, y: 120 },
            { id: 'P3', x: 200, y: 140 }, // Shoot pos
            { id: 'ball', x: 200, y: 140 },
             { id: 'target_finish', type: 'target', label: '', x: 200, y: 140, radius: 40 } as Entity
        ])
      }
    ]
  }
};

// --- DEFAULT MATCH DATA ---

export const DEFAULT_MATCH_META: MatchMeta = {
  tournament: "AFC Futsal Asian Cup",
  round: "Chung Kết",
  date: "20/10/2024 - 19:00",
  stadium: "Nhà thi đấu Phú Thọ"
};

export const DEFAULT_TEAM_A: TeamInfo = {
  id: "team_a",
  name: "Việt Nam",
  shortName: "VIE",
  logoUrl: "https://upload.wikimedia.org/wikipedia/vi/a/a1/Logo_VFF.svg",
  slogan: "Chiến Binh Sao Vàng",
  primaryColor: "#da251d",
  players: [
    { id: 'a1', number: 1, name: 'Hồ Văn Ý', nickname: 'Người Nhện', position: 'GK', isStarter: true },
    { id: 'a2', number: 10, name: 'Châu Đoàn Phát', nickname: 'Cầu Thủ Lớn', position: 'FIXO', isStarter: true },
    { id: 'a3', number: 8, name: 'Nguyễn Minh Trí', nickname: 'Trí Hí', position: 'PIVO', isStarter: true },
    { id: 'a4', number: 7, name: 'Nguyễn Anh Duy', position: 'ALA', isStarter: true },
    { id: 'a5', number: 4, name: 'Châu Mạnh Dũng', position: 'ALA', isStarter: true },
    { id: 'a6', number: 9, name: 'Nguyễn Thịnh Phát', nickname: 'Phát "Đầu Băng"', position: 'PIVO', isStarter: false },
    { id: 'a7', number: 11, name: 'Phạm Đức Hòa', nickname: 'Hòa Điếc', position: 'FIXO', isStarter: false },
  ]
};

export const DEFAULT_TEAM_B: TeamInfo = {
  id: "team_b",
  name: "Brazil",
  shortName: "BRA",
  logoUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/1/1d/Logo_cbf.svg/1200px-Logo_cbf.svg.png",
  slogan: "Joga Bonito",
  primaryColor: "#fcd116",
  players: [
    { id: 'b1', number: 1, name: 'Guitta', position: 'GK', isStarter: true },
    { id: 'b2', number: 10, name: 'Jean Pierre Guisel Costa', nickname: 'Pito', position: 'PIVO', isStarter: true },
    { id: 'b3', number: 6, name: 'Dyego Zuffo', nickname: 'Dyego', position: 'ALA', isStarter: true },
    { id: 'b4', number: 14, name: 'Rodrigo Hardy Araújo', nickname: 'Rodrigo', position: 'FIXO', isStarter: true },
    { id: 'b5', number: 8, name: 'Carlos Vagner Gularte Filho', nickname: 'Ferrão', position: 'PIVO', isStarter: true },
    { id: 'b6', number: 12, name: 'Roncaglio', position: 'GK', isStarter: false },
  ]
};
