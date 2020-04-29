import {
  Field,
  ID,
  Query,
  Resolver,
  Mutation,
  Arg,
  InputType,
  Ctx
} from "type-graphql";
import { Task } from "../entity/task";
import { User } from "../entity/user";
import { Context } from "../server";
import { UserNotFoundError, TaskNotFoundError } from "./error";

@InputType({ description: "New task data" })
class UpdateTaskInput implements Partial<Task> {
  @Field(_type => ID)
  id: string;

  @Field()
  title: String;

  @Field()
  done: boolean;

  @Field({ nullable: true })
  start?: Date;

  @Field({ nullable: true })
  end?: Date;

  @Field()
  includeTime: boolean;
}

@Resolver()
export class TaskResolver {
  @Query(_returns => [Task])
  async tasks(@Ctx() { user }: Context): Promise<Task[]> {
    return getUserTasks(user.id);
  }

  @Mutation(_returns => Task)
  async createTask(
    @Arg("title") title: string,
    @Ctx() { user }: Context
  ): Promise<Task> {
    return await createTask(user.id, title);
  }

  @Mutation(_returns => Task)
  async updateTask(@Arg("task") task: UpdateTaskInput): Promise<Task> {
    return await updateTask(task);
  }
}

// ------------------------- Business logic -------------------------

async function getUserTasks(userId: string): Promise<Task[]> {
  const user = await User.getById(userId, ["tasks"]);
  return user?.tasks ?? [];
}

async function createTask(userId: string, title: string): Promise<Task> {
  const user = await User.getById(userId);
  if (!user) throw UserNotFoundError;
  console.log("user.tasks: ", user.tasks);
  const task = Task.create({ title });
  user.tasks = [...(user.tasks ?? []), task];
  await user.save();

  return task;
}

async function updateTask(task: UpdateTaskInput): Promise<Task> {
  const update = await Task.update(task.id, task);
  console.log("update: ", update);
  const updatedTask = await Task.getById(task.id);
  console.log("updatedTask: ", updatedTask);
  if (!updatedTask) throw TaskNotFoundError;
  return updatedTask;
}
