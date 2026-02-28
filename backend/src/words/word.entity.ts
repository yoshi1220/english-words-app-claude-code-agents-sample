import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  spell: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  meaning: string;

  @CreateDateColumn()
  createdAt: Date;
}
