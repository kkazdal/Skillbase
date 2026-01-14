import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';

@Entity('events')
@Index('IDX_events_project_id_created_at', ['projectId', 'createdAt'])
@Index('IDX_events_project_id_user_id', ['projectId', 'userId'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ name: 'user_id', type: 'varchar', nullable: true })
  userId?: string | null;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'value', type: 'double precision', nullable: true })
  value?: number | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}


