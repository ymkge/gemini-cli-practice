export interface CandidateDate {
  id?: string; // Optional for frontend input
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface Event {
  id?: string; // Optional for frontend input
  title: string;
  description: string;
  candidateDates: CandidateDate[];
}
