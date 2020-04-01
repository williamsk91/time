import { getConnection, getRepository } from "typeorm";

import { IResolverMap } from "./types/graphql-utils";
import { List } from "./entity/List";
import { Task } from "./entity/Task";
import { User } from "./entity/User";
import { errors } from "./errors";

export const resolvers: IResolverMap = {
  Query: {
    me: async (_parent, _args, { req }) => {
      if (!req.userId) throw errors.notSignedIn;
      return User.findOne(req.userId);
    },
    list: async (_parent, { id }: GQL.IList, { req }) => {
      if (!req.userId) throw errors.notSignedIn;

      const list = await getRepository(List)
        .createQueryBuilder("list")
        .leftJoinAndSelect("list.user", "user")
        .leftJoinAndSelect("list.tasks", "task")
        .where("list.id = :id", { id })
        .getOne();

      if (!list || list.deleted) throw errors.noListFound;
      if (list.user.id !== req.userId) throw errors.noListAccess;

      return list;
    },
    userList: async (_parent, _args, { req }) => {
      if (!req.userId) throw errors.notSignedIn;

      const userId = req.userId;

      const userList = await getRepository(List)
        .createQueryBuilder("list")
        .leftJoinAndSelect("list.user", "user")
        .leftJoinAndSelect("list.tasks", "task")
        .where("user.id = :userId", { userId })
        .where("list.deleted = FALSE")
        .getMany();

      return userList;
    }
  },
  Mutation: {
    createList: async (
      _,
      { title }: GQL.ICreateListOnMutationArguments,
      { req }
    ) => {
      // ensure user is logged in
      if (!req.userId) throw errors.notSignedIn;

      const user = await User.findOne(req.userId);

      if (!user) throw errors.noUserFound;

      const newTask = Task.create({
        title: `${title} list first task`
      });

      const newList = List.create({
        title,
        tasks: [newTask],
        user
      });
      const list = await newList.save();

      return list;
    },
    deleteList: async (
      _,
      { id }: GQL.IDeleteListOnMutationArguments,
      { req }
    ) => {
      if (!req.userId) throw errors.notSignedIn;

      const list = await List.findOne(id);
      if (!list) throw errors.noListFound;

      list.deleted = true;
      await list.save();

      return list.id;
    },
    createTask: async (
      _parent,
      { listId, task: partialTask }: GQL.ICreateTaskOnMutationArguments,
      { req }
    ) => {
      if (!req.userId) throw errors.notSignedIn;

      const list = await List.findOne(listId);
      if (!list) throw errors.noListFound;

      const { done, title, start } = partialTask;
      const newTask = Task.create({
        done: done ? new Date(done) : undefined,
        title,
        start: start ? new Date(start) : undefined,
        list
      });
      const task = await newTask.save();
      console.log("task: ", task);

      return task;
    },
    updateTask: async (
      _parent,
      { task: partialTask }: GQL.IUpdateTaskOnMutationArguments,
      { req }
    ) => {
      if (!req.userId) throw errors.notSignedIn;

      // find task
      const task = await getRepository(Task)
        .createQueryBuilder("task")
        .leftJoinAndSelect("task.list", "list")
        .leftJoinAndSelect("list.user", "user")
        .where("task.id = :taskId", { taskId: partialTask.id })
        .where("user.id = :userId", { userId: req.userId })
        .where("list.deleted = FALSE")
        .getOne();

      console.log("task: ", task);

      if (!task) throw errors.noTaskFound;
      if (task.list.user.id !== req.userId) throw errors.noTaskAccess;

      await getConnection()
        .createQueryBuilder()
        .update(Task)
        .set({
          done: partialTask.done ? new Date(partialTask.done) : undefined,
          title: partialTask.title,
          start: partialTask.start ? new Date(partialTask.start) : undefined
        })
        .where("id = :id", { id: partialTask.id })
        .execute();

      return partialTask;
    },
    invalidateTokens: async (_, __, { req, res }) => {
      if (!req.userId) return false;

      // updates count
      const user = await User.findOne(req.userId);
      if (!user) return false;
      user.count += 1;
      await user.save();

      // clear cookies
      res.clearCookie("refresh-token");
      res.clearCookie("access-token");

      return true;
    }
  }
};
