import {
  Field,
  ID,
  Query,
  Resolver,
  Mutation,
  Arg,
  InputType,
  Ctx,
  Authorized,
  ObjectType
} from "type-graphql";
import { Task, Repeat } from "../entity/task";
import { User } from "../entity/user";
import { AuthorizedContext } from "../authorization/authChecker";
import { UserNotFoundError, TaskNotFoundError } from "../error";
import { getRepository, getConnection } from "typeorm";

@InputType({ description: "Recurring task input data" })
class RepeatInput implements Repeat {
  @Field()
  freq: "daily" | "weekly" | "monthly" | "yearly";

  @Field(_type => [Number], { nullable: true })
  byweekday?: number[];
}

@InputType({ description: "New task data" })
class UpdateTaskInput implements Partial<Task> {
  @Field(_type => ID)
  id: string;

  @Field()
  title: String;

  @Field({ nullable: true })
  done?: Date;

  @Field({ nullable: true })
  start?: Date;

  @Field({ nullable: true })
  end?: Date;

  @Field()
  includeTime: boolean;

  @Field({ nullable: true })
  color?: string;

  @Field()
  order: number;

  @Field({ nullable: true })
  repeat?: RepeatInput;
}

@ObjectType()
class TaskReorder implements Partial<Task> {
  @Field(_type => ID)
  id: string;

  @Field()
  order: number;
}

@InputType()
class TaskReorderInput implements Partial<Task> {
  @Field(_type => ID)
  id: string;

  @Field()
  order: number;
}

@Resolver()
export class TaskResolver {
  @Authorized()
  @Query(_returns => [Task])
  async tasks(@Ctx() { user }: AuthorizedContext): Promise<Task[]> {
    return getRepository(Task)
      .createQueryBuilder("task")
      .leftJoin("task.user", "user")
      .where("user.id = :id", { id: user.id })
      .andWhere("task.done is NULL")
      .orderBy("task.done", "ASC")
      .getMany();
  }

  @Authorized()
  @Query(_returns => [Task])
  async completedTasks(@Ctx() { user }: AuthorizedContext): Promise<Task[]> {
    return getRepository(Task)
      .createQueryBuilder("task")
      .leftJoin("task.user", "user")
      .where("user.id = :id", { id: user.id })
      .andWhere("task.done is not NULL")
      .orderBy("task.order", "ASC")
      .limit(10)
      .getMany();
  }

  @Authorized()
  @Mutation(_returns => Task)
  async createTask(
    @Arg("title") title: string,
    @Ctx() { user }: AuthorizedContext
  ): Promise<Task> {
    return await createTask(user.id, title);
  }

  @Authorized()
  @Mutation(_returns => Task)
  async updateTask(@Arg("task") task: UpdateTaskInput): Promise<Task> {
    return await updateTask(task);
  }

  @Authorized()
  @Mutation(_returns => [TaskReorder])
  async taskReorder(
    @Arg("tasks", _ => [TaskReorderInput])
    taskReorderInput: TaskReorderInput[]
  ): Promise<TaskReorder[]> {
    return taskReorderTransaction(taskReorderInput);
  }
}

// ------------------------- Business logic -------------------------

async function createTask(userId: string, title: string): Promise<Task> {
  const user = await User.getById(userId);
  if (!user) throw UserNotFoundError;

  const task = Task.create({ title, user });
  await task.save();

  return task;
}

async function updateTask(task: UpdateTaskInput): Promise<Task> {
  await Task.update(task.id, task);
  const updatedTask = await Task.getById(task.id);
  if (!updatedTask) throw TaskNotFoundError;
  return updatedTask;
}

/**
 * Reorders task by cycling the order of the tasks.
 * Returns the updated task id with their new orders.
 */
async function taskReorderTransaction(
  taskReorder: TaskReorder[]
): Promise<TaskReorder[]> {
  const shiftedOrder = cycleArray(taskReorder);
  await getConnection().transaction(async transManager => {
    const maps = taskReorder.map(
      async ({ id }, i) =>
        await transManager
          .createQueryBuilder()
          .update(Task)
          .set({ order: shiftedOrder[i].order })
          .where("id = :id", { id })
          .execute()
    );
    await Promise.all(maps);
  });
  return taskReorder.map((t, i) => ({ ...t, order: shiftedOrder[i].order }));
}

/**
 * Cycles the element of the array
 */
const cycleArray = <T>(array: T[]): T[] =>
  array.map((_, i, a) => a[i + 1 === a.length ? 0 : i + 1]);
