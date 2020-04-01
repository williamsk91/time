import {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} from "apollo-server-errors";

const notSignedIn = new AuthenticationError("user is not signed in");

const noUserFound = new AuthenticationError("user does not exist");

const noListAccess = new ForbiddenError("user has no access to list");

const noListFound = new UserInputError("list does not exist");

const noTaskAccess = new ForbiddenError("user has no access to task");

const noTaskFound = new UserInputError("task does not exist");

export const errors = {
  notSignedIn,
  noUserFound,
  noListAccess,
  noListFound,
  noTaskAccess,
  noTaskFound
};
