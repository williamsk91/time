import { Field, ID, ObjectType } from "type-graphql";
import { registerEnumType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Task } from "./task";

export enum RepeatFrequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}

registerEnumType(RepeatFrequency, {
  name: "RepeatFrequency",
});

export type WeekdayStr = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

@ObjectType()
@Entity()
export class Repeat extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field((_type) => RepeatFrequency)
  @Column()
  freq: RepeatFrequency;

  @Field({ nullable: true })
  @Column({ default: null })
  end?: Date;

  @Field(() => [String], { nullable: true })
  @Column({ type: "simple-array", default: null })
  byweekday?: WeekdayStr[];

  @Field(() => [String], { nullable: true })
  @Column({ type: "simple-array", default: [] })
  exclude: string[];

  // ------------------------- relation -------------------------
  @OneToOne(() => Task, (task) => task.repeat)
  task: Task;

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  // ------------------------- static functions -------------------------
  static async getById(id: string): Promise<Repeat | undefined> {
    return await Repeat.findOne({ id });
  }
}
