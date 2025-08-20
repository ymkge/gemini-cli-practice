import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Event } from "./Event";

@Entity()
export class CandidateDate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  date: string; // YYYY-MM-DD

  @Column()
  time: string; // HH:MM

  @ManyToOne(() => Event, event => event.candidateDates)
  event: Event;
}
