import {
  Field,
  ID,
  Query,
  Resolver,
  Mutation,
  Arg,
  InputType,
  Ctx,
  Authorized
} from "type-graphql";
import { Task } from "../entity/task";
import { User } from "../entity/user";
import { AuthorizedContext } from "../authorization/authChecker";
import { UserNotFoundError, TaskNotFoundError } from "../error";
import { getRepository } from "typeorm";

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
  @Authorized()
  @Query(_returns => [Task])
  async tasks(@Ctx() { user }: AuthorizedContext): Promise<Task[]> {
    return getRepository(Task)
      .createQueryBuilder("task")
      .leftJoin("task.user", "user")
      .where("user.id = :id", { id: user.id })
      .andWhere("task.done = false")
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
