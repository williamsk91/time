import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-errors";

export type ServerError = ApolloError;

export const UserNotFoundError = new AuthenticationError("user not found");

export const ListNotFoundError = new UserInputError("list not found");
export const ListUnauthorized = new ForbiddenError(
  "list does not belong to user"
);

export const TaskNotFoundError = new UserInputError("task not found");

export const RepeatNotFoundError = new UserInputError("repeat not found");
export const RepeatAlreadyExistError = new UserInputError(
  "repeat already exist"
);
