import { Router } from 'express';
import { createEvent } from '../controllers/eventController';

const router = Router();

router.post('/events', createEvent);

export default router;
