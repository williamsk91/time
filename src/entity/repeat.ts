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
import { Task } from "./task";

export enum RepeatFrequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Yearly = "yearly",
}
export type WeekdayStr = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

@ObjectType()
@Entity()
export class Repeat extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  freq: RepeatFrequency;

  @Field()
  @Column()
  start: Date;

  @Field({ nullable: true })
  @Column({ default: null })
  end?: Date;

  @Field(() => [String], { nullable: true })
  @Column({ type: "simple-array", default: null })
  byweekday?: WeekdayStr[];

  @Field(() => [String], { nullable: true })
  @Column({ type: "simple-array", default: [] })
  exclude: string[];

  @Field({ nullable: true })
  deleted?: Date;

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
