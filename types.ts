
export type EntityType = 'attacker' | 'defender' | 'gk' | 'ball' | 'target';

export interface Entity {
  id: string;
  type: EntityType;
  label: string;
  x: number;
  y: number;
  attachedTo?: string; // ID of the entity this one is following (Group/Man-marking)
  radius?: number; // For target zones or specialized areas
}

export interface Step {
  id: number;
  title: string;
  duration: number; // Time in seconds to transition TO this step from previous
  entities: Entity[]; // Snapshot of all entities in this step
  notes?: string;
}

export interface Scenario {
  id: number;
  title: string;
  desc: string;
  tacticalAnalysis: string[];
  steps: Step[]; // Ordered list of steps
}

// --- New Types for Match Management ---

export interface PlayerInfo {
  id: string;
  number: number;
  name: string;
  nickname?: string; // Biệt danh
  position: string; // FIX, ALA, PIVO, GK
  isStarter: boolean;
  avatarUrl?: string;
}

export interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  slogan: string;
  primaryColor: string;
  players: PlayerInfo[];
}

export interface MatchMeta {
  tournament: string;
  round: string;
  date: string;
  stadium: string;
}
