import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CandidateDate } from "./CandidateDate";

@Entity()
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => CandidateDate, candidateDate => candidateDate.event, { cascade: true })
  candidateDates: CandidateDate[];
}
