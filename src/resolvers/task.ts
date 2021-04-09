import {
  Field,
  ID,
  Query,
  Resolver,
  Mutation,
  Arg,
  InputType,
  Authorized,
  ObjectType,
  ResolverInterface,
  FieldResolver,
  Root,
} from "type-graphql";
import { Task } from "../entity/task";
import { TaskNotFoundError, ListNotFoundError } from "../error";
import { getRepository, getConnection } from "typeorm";
import { List } from "../entity/list";
import { TaskAuthorized, ListAuthorized } from "../decorator/authorization";
import { Repeat } from "../entity/repeat";
import { UpsertRepeatInput } from "./repeat";

@InputType({ description: "New task data" })
class UpdateTaskInput implements Partial<Task> {
  @Field((_type) => ID)
  id: string;

  @Field()
  title: string;

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
}

@ObjectType()
class TaskReorder implements Partial<Task> {
  @Field((_type) => ID)
  id: string;

  @Field()
  order: number;
}

@InputType()
class TaskReorderInput implements Partial<Task> {
  @Field((_type) => ID)
  id: string;

  @Field()
  order: number;
}

@InputType()
class CreateTaskInput {
  @Field()
  title: string;

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

  @Field({ nullable: true })
  repeat?: UpsertRepeatInput;
}

@Resolver()
export class TaskResolver {
  @Authorized()
  @TaskAuthorized()
  @Query((_returns) => Task)
  async task(@Arg("id", () => ID) id: string): Promise<Task> {
    const task = await getRepository(Task)
      .createQueryBuilder("task")
      .where("task.id = :id", { id })
      .andWhere("task.deleted is NULL")
      .getOne();
    if (!task) throw TaskNotFoundError;

    return task;
  }

  @Authorized()
  @ListAuthorized()
  @Query((_returns) => [Task])
  async tasks(@Arg("listId", () => ID) listId: string): Promise<Task[]> {
    return getTasks(listId);
  }

  @Authorized()
  @ListAuthorized()
  @Query((_returns) => [Task])
  async completedTasks(
    @Arg("listId", () => ID) listId: string
  ): Promise<Task[]> {
    return getRepository(Task)
      .createQueryBuilder("task")
      .innerJoin("task.list", "list", "list.id = :id", { id: listId })
      .where("task.done is not NULL")
      .andWhere("task.deleted is NULL")
      .orderBy("task.order", "ASC")
      .getMany();
  }

  @Authorized()
  @ListAuthorized()
  @Mutation((_returns) => Task)
  async createTask(
    @Arg("listId", () => ID) listId: string,
    @Arg("task") task: CreateTaskInput
  ): Promise<Task> {
    return await createTask(listId, task);
  }

  @Authorized()
  @TaskAuthorized()
  @Mutation((_returns) => Task)
  async updateTaskList(
    @Arg("id", () => ID) id: string,
    @Arg("newListId", () => ID) listId: string
  ): Promise<Task> {
    return await updateTaskList(id, listId);
  }

  @Authorized()
  @TaskAuthorized()
  @Mutation((_returns) => Task)
  async updateTask(@Arg("task") task: UpdateTaskInput): Promise<Task> {
    return await updateTask(task);
  }

  @Authorized()
  @Mutation((_returns) => [TaskReorder])
  async taskReorder(
    @Arg("tasks", () => [TaskReorderInput])
    taskReorderInput: TaskReorderInput[]
  ): Promise<TaskReorder[]> {
    return taskReorderTransaction(taskReorderInput);
  }

  @Authorized()
  @TaskAuthorized()
  @Mutation((_returns) => Task)
  async deleteTask(@Arg("id", () => ID) id: string): Promise<Task> {
    return deleteTask(id);
  }
}

@Resolver(() => Task)
export class TaskObjectResolver implements ResolverInterface<Task> {
  @FieldResolver()
  repeat(@Root() task: Task): Promise<Repeat | undefined> {
    return getRepeatByTaskId(task.id);
  }
}

// ------------------------- Business logic -------------------------

export async function getTasks(listId: string): Promise<Task[]> {
  return getRepository(Task)
    .createQueryBuilder("task")
    .innerJoin("task.list", "list", "list.id = :id", { id: listId })
    .andWhere("task.deleted is NULL")
    .orderBy("task.done", "ASC")
    .getMany();
}

async function createTask(
  listId: string,
  task: CreateTaskInput
): Promise<Task> {
  const list = await List.getById(listId);
  if (!list) throw ListNotFoundError;

  const newTask = Task.create({ ...task, list });
  await newTask.save();

  return newTask;
}

async function updateTaskList(id: string, listId: string): Promise<Task> {
  const task = await Task.getById(id);
  if (!task) throw TaskNotFoundError;

  const list = await List.getById(listId);
  if (!list) throw ListNotFoundError;

  if (list !== task.list) {
    task.list = list;
    await task.save();
  }

  return task;
}

async function updateTask(task: UpdateTaskInput): Promise<Task> {
  await Task.update(task.id, task);
  const updatedTask = await Task.getById(task.id);
  if (!updatedTask) throw TaskNotFoundError;
  return updatedTask;
}

async function deleteTask(taskId: string): Promise<Task> {
  const task = await Task.getById(taskId);
  if (!task) throw TaskNotFoundError;

  task.deleted = new Date();
  await task.save();

  return task;
}

/**
 * Reorders task by cycling the order of the tasks.
 * Returns the updated task id with their new orders.
 */
async function taskReorderTransaction(
  taskReorder: TaskReorder[]
): Promise<TaskReorder[]> {
  const shiftedOrder = cycleArray(taskReorder);
  await getConnection().transaction(async (transManager) => {
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

const getRepeatByTaskId = (taskId: string): Promise<Repeat | undefined> =>
  getRepository(Repeat)
    .createQueryBuilder("repeat")
    .leftJoinAndSelect("repeat.task", "task")
    .where("task.id = :taskId", { taskId })
    .andWhere("task.deleted is NULL")
    .getOne();

/**
 * Cycles the element of the array
 */
const cycleArray = <T>(array: T[]): T[] =>
  array.map((_, i, a) => a[i + 1 === a.length ? 0 : i + 1]);
