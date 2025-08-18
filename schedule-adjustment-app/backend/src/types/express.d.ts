import { User } from './user'; // Assuming user.d.ts is in the same directory

declare global {
  namespace Express {
    interface User extends User {} // Extend Express.User with your custom User type
    interface Request {
      user?: User; // Make user property optional
    }
  }
}
