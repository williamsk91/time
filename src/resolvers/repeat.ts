import {
  Arg,
  Authorized,
  Field,
  ID,
  InputType,
  Mutation,
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
export class UpsertRepeatInput implements Partial<Repeat> {
  @Field((_type) => RepeatFrequency)
  freq: RepeatFrequency;

  @Field({ nullable: true })
  end?: Date;

  @Field((_type) => [String], { nullable: true })
  byweekday?: WeekdayStr[];

  @Field(() => [String], { nullable: true })
  exclude: string[];
}

@Resolver()
export class RepeatResolver {
  @Authorized()
  @Mutation((_returns) => Repeat)
  async setRepeat(
    @Arg("taskId", () => ID) taskId: string,
    @Arg("repeat", { nullable: true }) repeat?: UpsertRepeatInput
  ): Promise<Repeat> {
    return await setTaskRepeat(taskId, repeat);
  }
}

// ------------------------- Business logic -------------------------

async function createRepeat(
  taskId: string,
  repeat: UpsertRepeatInput
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
  repeat: UpsertRepeatInput
): Promise<Repeat> {
  await Repeat.update(id, repeat);
  const updatedRepeat = await Repeat.getById(id);
  if (!updatedRepeat) throw RepeatNotFoundError;
  return updatedRepeat;
}

async function deleteRepeat(taskId: string, repeatId: string): Promise<Repeat> {
  const repeat = await Repeat.getById(repeatId);
  if (!repeat) throw RepeatNotFoundError;

  // removing foreign key constraint
  await Task.update({ id: taskId }, { repeat: undefined });

  await Repeat.remove(repeat);

  repeat.id = repeatId;
  return repeat;
}

/**
 * if `repeat` is defined upsert it. Else delete it
 */
async function setTaskRepeat(
  taskId: string,
  repeat?: UpsertRepeatInput
): Promise<Repeat> {
  const task = await getRepository(Task)
    .createQueryBuilder("task")
    .where("task.id = :taskId", { taskId })
    .andWhere("task.deleted is NULL")
    .leftJoinAndSelect("task.repeat", "repeat")
    .getOne();
  if (!task) throw TaskNotFoundError;

  // delete
  if (!repeat) {
    if (!task.repeat) throw RepeatNotFoundError;
    return deleteRepeat(taskId, task.repeat.id);
  }

  // insert
  if (!task.repeat) return createRepeat(task.id, repeat);

  return updateRepeat(task.repeat.id, repeat);
}
