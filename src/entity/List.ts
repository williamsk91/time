import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Task } from "./Task";
import { User } from "./User";
import uuid from "uuid/v4";

@Entity()
export class List extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @BeforeInsert()
  generateId = async () => {
    this.id = uuid();
  };

  @Column("varchar", { length: 255, unique: true })
  title: string;

  @OneToMany(() => Task, (task) => task.list, { cascade: true })
  tasks: Task[];

  @Column("integer", { default: 0 })
  taskCreated: number;

  @ManyToOne(() => User, (user) => user.lists)
  user: User;

  @Column("boolean", { default: false })
  deleted: boolean;

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}
