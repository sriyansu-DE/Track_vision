export type Team = { id: string; team_code: string; name: string; college: string | null };
export type Race = { id: string; team_id: string; status: 'running'|'completed'|'disqualified'|'reset'; started_at: string; finished_at: string | null; duration_ms: number | null; current_checkpoint: number };
export type Result = Race & { teams: Team };
