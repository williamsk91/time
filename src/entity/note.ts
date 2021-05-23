import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { JsonScalar } from "../scalar/json";
import { Task } from "./task";

@ObjectType()
@Entity()
export class Note extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field((_type) => JsonScalar)
  @Column({ type: "jsonb" })
  body: Object;

  // ------------------------- relation -------------------------
  @OneToOne(() => Task, (task) => task.note)
  task: Task;

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  // ------------------------- static functions -------------------------
  static async getById(id: string): Promise<Note | undefined> {
    return await Note.findOne({ id });
  }
}
