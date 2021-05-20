import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { List } from "./list";
import { Note } from "./note";
import { Repeat } from "./repeat";

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

  @Field({ nullable: true })
  @Column({ default: null })
  deleted?: Date;

  // ------------------------- relation -------------------------
  @ManyToOne(() => List, (list) => list.tasks)
  list: List;

  @Field(() => Repeat, { nullable: true })
  @OneToOne(() => Repeat, (repeat) => repeat.task, { cascade: true })
  @JoinColumn()
  repeat?: Repeat;

  @Field(() => Note, { nullable: true })
  @OneToOne(() => Note, (note) => note.task, { cascade: true })
  @JoinColumn()
  note?: Note;

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
