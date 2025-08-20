export interface CandidateDate {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface Event {
  id: string;
  title: string;
  description: string;
  candidateDates: CandidateDate[];
}
