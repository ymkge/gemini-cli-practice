import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import errorHandler from './middlewares/errorHandler';
import { AppDataSource } from './data-source'; // Import AppDataSource
import "reflect-metadata"; // Required for TypeORM

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize TypeORM and start server
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");

    // Middlewares
    app.use(
      cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
      })
    );
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(
      session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          secure: process.env.NODE_ENV === 'production', // only https in production
          httpOnly: true,
        },
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    // Routes
    app.use('/auth', authRoutes);
    app.use('/api', apiRoutes);

    app.get('/', (req: Request, res: Response) => {
      res.send('Backend server is running!');
    });

    app.use(errorHandler); // Error handling middleware

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => console.error("Error during Data Source initialization:", error));
