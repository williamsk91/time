import {
  Arg,
  Authorized,
  Field,
  ID,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Repeat, RepeatFrequency, WeekdayStr } from "../entity/repeat";
import { Task } from "../entity/task";
import {
  TaskNotFoundError,
  RepeatNotFoundError,
  RepeatAlreadyExistError,
} from "../error";

@InputType()
class CreateRepeatInput implements Partial<Repeat> {
  @Field((_type) => RepeatFrequency)
  freq: RepeatFrequency;

  @Field()
  start: Date;
}

@InputType()
class UpdateRepeatInput implements Partial<Repeat> {
  @Field()
  freq: RepeatFrequency;

  @Field()
  start: Date;

  @Field({ nullable: true })
  end?: Date;

  @Field((_type) => [String], { nullable: true })
  byweekday?: WeekdayStr[];

  @Field(() => [String], { nullable: true })
  exclude: string[];
}

@Resolver()
export class TaskResolver {
  @Authorized()
  @Query((_returns) => Repeat)
  async repeat(@Arg("id", () => ID) id: string): Promise<Repeat | undefined> {
    const repeat = await getRepository(Repeat)
      .createQueryBuilder("repeat")
      .where("repeat.id = :id", { id })
      .andWhere("repeat.deleted is NULL")
      .getOne();

    return repeat;
  }

  @Authorized()
  @Mutation((_returns) => Repeat)
  async createRepeat(
    @Arg("taskId", () => ID) taskId: string,
    @Arg("repeat") repeat: CreateRepeatInput
  ): Promise<Repeat> {
    return await createRepeat(taskId, repeat);
  }

  @Authorized()
  @Mutation((_returns) => Repeat)
  async updateRepeat(
    @Arg("repeatId", () => ID) repeatId: string,
    @Arg("repeat") repeat: UpdateRepeatInput
  ): Promise<Repeat> {
    return await updateRepeat(repeatId, repeat);
  }

  @Authorized()
  @Mutation((_returns) => Repeat)
  async deleteRepeat(@Arg("id", () => ID) id: string): Promise<Repeat> {
    return deleteRepeat(id);
  }
}

// ------------------------- Business logic -------------------------

async function createRepeat(
  taskId: string,
  repeat: CreateRepeatInput
): Promise<Repeat> {
  const task = await getRepository(Task)
    .createQueryBuilder("task")
    .where("task.id = :taskId", { taskId })
    .andWhere("task.deleted is NULL")
    .leftJoinAndSelect("task.repeat", "repeat")
    .getOne();

  if (!task) throw TaskNotFoundError;
  if (!!task.repeat) throw RepeatAlreadyExistError;

  const newRepeat = Repeat.create({ ...repeat, task });
  await newRepeat.save();

  return newRepeat;
}

async function updateRepeat(
  id: string,
  repeat: UpdateRepeatInput
): Promise<Repeat> {
  await Repeat.update(id, repeat);
  const updatedRepeat = await Repeat.getById(id);
  if (!updatedRepeat) throw RepeatNotFoundError;
  return updatedRepeat;
}

async function deleteRepeat(repeatId: string): Promise<Repeat> {
  const repeat = await Repeat.getById(repeatId);
  if (!repeat) throw RepeatNotFoundError;

  repeat.deleted = new Date();
  await repeat.save();

  return repeat;
}
