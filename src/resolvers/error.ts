import { ApolloError, UserInputError } from "apollo-server";

import { AuthenticationError } from "apollo-server-errors";

export type ServerError = ApolloError;

export const UserNotFoundError = new AuthenticationError("user not found");
export const TaskNotFoundError = new UserInputError("task not found");
