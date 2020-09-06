import { createMethodDecorator } from "type-graphql";
import { AuthorizedContext } from "../authorization/authChecker";
import { List } from "../entity/list";
import { getRepository } from "typeorm";
import { ListNotFoundError, TaskNotFoundError } from "../error";
import { Task } from "../entity/task";

/**
 * Guard - ensure list belongs to the user.
 *
 * Requires:
 *  1. **@Authorized** guard
 *  1. `listId` OR `list.id` arg
 */
export const ListAuthorized = () => {
  return createMethodDecorator<AuthorizedContext>(
    async ({ context, args }, next) => {
      const userId = context.user.id;

      const listId: string | undefined = args.listId || args.list?.id;
      if (!listId) {
        throw new Error("ListAuthorized Error - list's id is undefined");
      }

      const list = await getRepository(List)
        .createQueryBuilder("list")
        .leftJoin("list.user", "user", "user.id = :id", { id: userId })
        .where("list.id = :id", { id: listId })
        .andWhere("list.deleted is NULL")
        .getOne();

      if (!list) throw ListNotFoundError;

      return next();
    }
  );
};

/**
 * Guard - ensure task belongs to the user.
 *
 * Requires:
 *  1. **@Authorized** guard
 *  1. `id` OR `taskId` OR `task.id` arg
 */
export const TaskAuthorized = () => {
  return createMethodDecorator<AuthorizedContext>(
    async ({ context, args }, next) => {
      const userId = context.user.id;

      const taskId: string | undefined =
        args.id || args.taskId || args.task?.id;
      if (!taskId) {
        throw new Error("TaskAuthorized Error - task's id is undefined");
      }

      const task = await getRepository(Task)
        .createQueryBuilder("task")
        .innerJoin("task.list", "list")
        .leftJoin("list.user", "user", "user.id = :id", { id: userId })
        .where("task.id = :id", { id: taskId })
        .getOne();
      console.log("task: ", task);

      if (!task) throw TaskNotFoundError;

      return next();
    }
  );
};
