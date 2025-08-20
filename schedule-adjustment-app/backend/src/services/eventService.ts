import { AppDataSource } from '../data-source';
import { Event } from '../entity/Event';
import { CandidateDate } from '../entity/CandidateDate';

export const createEvent = async (title: string, description: string, candidateDatesData: { date: string; time: string }[]): Promise<Event> => {
  const eventRepository = AppDataSource.getRepository(Event);
  const candidateDateRepository = AppDataSource.getRepository(CandidateDate);

  const newEvent = new Event();
  newEvent.title = title;
  newEvent.description = description;

  const newCandidateDates = candidateDatesData.map(cd => {
    const candidateDate = new CandidateDate();
    candidateDate.date = cd.date;
    candidateDate.time = cd.time;
    return candidateDate;
  });

  newEvent.candidateDates = newCandidateDates;

  await eventRepository.save(newEvent);
  return newEvent;
};

export const getEventById = async (id: string): Promise<Event | undefined> => {
  const eventRepository = AppDataSource.getRepository(Event);
  return eventRepository.findOne({ where: { id }, relations: ['candidateDates'] });
};

export const getAllEvents = async (): Promise<Event[]> => {
  const eventRepository = AppDataSource.getRepository(Event);
  return eventRepository.find({ relations: ['candidateDates'] });
};