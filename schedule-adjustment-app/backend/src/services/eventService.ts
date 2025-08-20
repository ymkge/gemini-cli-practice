import { Event, CandidateDate } from '../types/event';
import { v4 as uuidv4 } from 'uuid';

const events: Event[] = [];

export const createEvent = (title: string, description: string, candidateDatesData: { date: string; time: string }[]): Event => {
  const newEvent: Event = {
    id: uuidv4(),
    title,
    description,
    candidateDates: candidateDatesData.map(cd => ({
      id: uuidv4(),
      date: cd.date,
      time: cd.time,
    })),
  };
  events.push(newEvent);
  return newEvent;
};

export const getEventById = (id: string): Event | undefined => {
  return events.find(event => event.id === id);
};

export const getAllEvents = (): Event[] => {
  return events;
};
