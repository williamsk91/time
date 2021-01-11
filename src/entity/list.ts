import { ObjectType, Field, ID } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Generated,
} from "typeorm";
import { Task } from "./task";
import { User } from "./user";

@ObjectType()
@Entity()
export class List extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  title: string;

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
  @ManyToOne(() => User, (user) => user.lists)
  user: User;

  @Field(() => [Task])
  @OneToMany(() => Task, (task) => task.list, { cascade: true })
  tasks: Task[];

  // ------------------------- extra column -------------------------
  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  // ------------------------- static functions -------------------------
  static async getById(id: string): Promise<List | undefined> {
    return await List.findOne({ id });
  }
}
