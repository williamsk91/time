import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { List } from "./List";
import uuid from "uuid";

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @BeforeInsert()
  generateId = async () => {
    this.id = uuid();
  };

  @Column("timestamp with time zone", {
    nullable: true,
  })
  done: string;

  @Column("varchar")
  title: string;

  @Column("timestamp with time zone", {
    nullable: true,
  })
  start: string;

  @Column("integer", {})
  order: number;

  @ManyToOne(() => List, (list) => list.tasks)
  list: List;

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
