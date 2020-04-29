import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

import { Task } from "./task";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(_type => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  googleId?: string;

  // ------------------------- relation -------------------------
  @OneToMany(() => Task, task => task.user, { cascade: true })
  tasks: Task[];

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  // ------------------------- static functions -------------------------
  static async getById(
    id: string,
    relations: "tasks"[] = []
  ): Promise<User | undefined> {
    return await User.findOne({ id }, { relations });
  }
}
