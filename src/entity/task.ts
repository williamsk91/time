import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";

import { User } from "./user";

@ObjectType()
@Entity()
export class Task extends BaseEntity {
  @Field(_type => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  title: String;

  @Field()
  @Column({ default: false })
  done: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  start?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, default: null })
  end?: Date;

  @Field()
  @Column({ default: false })
  includeTime: boolean;

  // ------------------------- relation -------------------------
  @ManyToOne(() => User, user => user.tasks)
  user: User;

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  // ------------------------- static functions -------------------------
  static async getById(id: string): Promise<Task | undefined> {
    return await Task.findOne({ id });
  }
}