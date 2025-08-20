import { Request, Response } from 'express';
import * as eventService from '../services/eventService';

export const createEvent = (req: Request, res: Response) => {
  try {
    const { title, description, candidateDates } = req.body;

    if (!title || !candidateDates || !Array.isArray(candidateDates)) {
      return res.status(400).json({ message: 'Title and candidate dates are required.' });
    }

    const newEvent = eventService.createEvent(title, description || '', candidateDates);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
