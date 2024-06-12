import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  uuid: string;

  @Column({ nullable: false, default: false })
  isUsed: boolean;
}
