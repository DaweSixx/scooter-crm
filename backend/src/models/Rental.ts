import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Scooter } from "./Scooter";

@Entity()
export class Rental {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Scooter, { onDelete: 'CASCADE' })
  scooter!: Scooter;

  @Column()
  userName!: string;

  @Column()
  userPhone!: string;

  @CreateDateColumn()
  startTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime!: Date | null;

  @Column({
    type: "enum",
    enum: ['active', 'completed'],
    default: 'active'
  })
  status!: 'active' | 'completed';
}