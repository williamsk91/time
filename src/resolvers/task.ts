import {
  Field,
  ID,
  ObjectType,
  Query,
  Resolver,
  Mutation,
  Arg,
  InputType
} from "type-graphql";

@ObjectType()
export class Task {
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
  async tasks(): Promise<[Task]> {
    return [
      {
        id: "task_id",
        title: "task_title",
        done: false,
        start: undefined,
        end: undefined,
        includeTime: false
      }
    ];
  }

  @Mutation(_returns => Task)
  async createTask(@Arg("title") title: string): Promise<Task> {
    return {
      id: "task_id_created",
      title,
      done: true,
      start: undefined,
      end: undefined,
      includeTime: false
    };
  }

  @Mutation(_returns => Task)
  async updateTask(@Arg("task") task: UpdateTaskInput): Promise<Task> {
    return {
      ...task
    };
  }
}
