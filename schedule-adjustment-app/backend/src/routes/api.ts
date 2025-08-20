import { Router, Request, Response, NextFunction } from 'express';
import { getFreeBusy } from '../controllers/calendarController'; // Import the controller
import { body, validationResult } from 'express-validator'; // Add this line
import eventRoutes from './eventRoutes'; // Import event routes

const router = Router();

// ユーザーが認証済みか確認するミドルウェア
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// バリデーションミドルウェア
const validateFreeBusyRequest = [
  body('timeMin').isISO8601().withMessage('timeMin must be a valid ISO 8601 date string'),
  body('timeMax').isISO8601().withMessage('timeMax must be a valid ISO 8601 date string'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// カレンダーの空き時間を取得するAPI
router.post('/calendar/freebusy', isAuthenticated, validateFreeBusyRequest, getFreeBusy); // Add validation middleware

// Event routes
router.use(eventRoutes);

export default router;
