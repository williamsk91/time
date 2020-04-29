import { Query, Resolver, Ctx } from "type-graphql";

import { User } from "../entity/user";
import { Context } from "../server";
import { UserNotFoundError } from "./error";

@Resolver()
export class UserResolver {
  @Query(_return => User)
  async me(@Ctx() { user }: Context): Promise<User> {
    const userData = await User.getById(user.id);
    if (!userData) throw UserNotFoundError;
    return userData;
  }
}
