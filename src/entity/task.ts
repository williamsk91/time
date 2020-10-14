import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { List } from "./list";

@ObjectType()
export class Repeat {
  @Field()
  freq: "daily" | "weekly" | "monthly" | "yearly";

  @Field((_type) => [Number], { nullable: true })
  byweekday?: number[];
}

@ObjectType()
@Entity()
export class Task extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ default: null })
  done?: Date;

  @Field({ nullable: true })
  @Column({ default: null })
  start?: Date;

  @Field({ nullable: true })
  @Column({ default: null })
  end?: Date;

  @Field()
  @Column({ default: false })
  includeTime: boolean;

  @Field({ nullable: true })
  @Column({ default: null })
  color?: string;

  @Field()
  @Column()
  @Generated("increment")
  order: number;

  @Field((_type) => Repeat, { nullable: true })
  @Column({ type: "jsonb", default: null })
  repeat?: Repeat;

  @Field({ nullable: true })
  @Column({ default: null })
  deleted?: Date;

  // ------------------------- relation -------------------------
  @ManyToOne(() => List, (list) => list.tasks)
  list: List;

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
