import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { List } from "./list";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @Column({ default: 0 })
  count: number;

  @Column({ default: null })
  deleted?: Date;

  // ------------------------- relation -------------------------
  @OneToMany(() => List, (list) => list.user, { cascade: true })
  lists: List[];

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
