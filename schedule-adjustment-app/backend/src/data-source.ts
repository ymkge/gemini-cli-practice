import "reflect-metadata";
import { DataSource } from "typeorm";
import { Event } from "./entity/Event";
import { CandidateDate } from "./entity/CandidateDate";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "./src/database.sqlite", // Path to your SQLite database file
  synchronize: true, // Auto-create schema on app start (for development)
  logging: false, // Disable logging for now
  entities: [Event, CandidateDate], // Register your entities here
  migrations: [],
  subscribers: [],
});
