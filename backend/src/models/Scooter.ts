import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from "typeorm";

export type ScooterStatus = 'available' | 'in_use' | 'maintenance' | 'offline';

@Entity()
export class Scooter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string; // Номер/модель

  @Column()
  model!: string;

  @Column({
    type: "enum",
    enum: ['available', 'in_use', 'maintenance', 'offline'],
    default: 'available'
  })
  status!: ScooterStatus;

  @Column({ type: "int" })
  batteryLevel!: number;

  @Column({ type: "float" })
  latitude!: number;

  @Column({ type: "float" })
  longitude!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}