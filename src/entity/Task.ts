import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
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

  @Column({
    nullable: true
  })
  done: Date;

  @Column("varchar")
  title: string;

  @Column({
    nullable: true
  })
  start: Date;

  @ManyToOne(
    () => List,
    list => list.tasks
  )
  list: List;

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
