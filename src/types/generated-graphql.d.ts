// tslint:disable
// graphql typescript definitions

declare namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
list: IList;
userList: Array<IList>;
me: IUser | null;
}

interface IListOnQueryArguments {
id: string;
}

interface IList {
__typename: "List";
id: string;
title: string;
tasks: Array<ITask>;
}

interface ITask {
__typename: "Task";
id: string;
done: string | null;
title: string;
start: string | null;
hasTime: boolean;
}

interface IUser {
__typename: "User";
id: string;
email: string;
displayName: string | null;
}

interface IMutation {
__typename: "Mutation";
createList: IList;
deleteList: string;
createTask: ITask;
updateTask: ITask;
invalidateTokens: boolean;
}

interface ICreateListOnMutationArguments {
title: string;
}

interface IDeleteListOnMutationArguments {
id: string;
}

interface ICreateTaskOnMutationArguments {
listId: string;
task: ICreateTaskInput;
}

interface IUpdateTaskOnMutationArguments {
task: IUpdateTaskInput;
}

interface ICreateTaskInput {
done?: string | null;
title: string;
start?: string | null;
}

interface IUpdateTaskInput {
id: string;
done?: string | null;
title: string;
start?: string | null;
hasTime: boolean;
}
}

// tslint:enable
