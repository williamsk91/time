import { Field, ID, ObjectType, Query, Resolver } from "type-graphql";

@ObjectType()
export class User {
  @Field(_type => ID)
  id: string;
}

@Resolver()
export class UserResolver {
  @Query(_return => User)
  async me(): Promise<User> {
    return {
      id: "userUD"
    };
  }
}
