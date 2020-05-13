import { Query, Resolver, Ctx, Authorized, Mutation } from "type-graphql";

import { User } from "../entity/user";
import { AuthorizedContext } from "../authorization/authChecker";
import { UserNotFoundError } from "../error";
import { clearJWTCookie } from "../authorization/JWT";

@Resolver()
export class UserResolver {
  @Authorized()
  @Query(_return => User)
  async me(@Ctx() { user }: AuthorizedContext): Promise<User> {
    const userData = await User.getById(user.id);
    if (!userData) throw UserNotFoundError;
    return userData;
  }

  @Authorized()
  @Mutation(_return => Boolean)
  async invalidateTokens(
    @Ctx() { user: { id }, res }: AuthorizedContext
  ): Promise<boolean> {
    // updates count
    const userData = await User.getById(id);
    if (!userData) throw UserNotFoundError;
    userData.count += 1;
    await userData.save();

    // clear cookies
    clearJWTCookie(res);

    return true;
  }
}

// ------------------------- Business logic -------------------------

export const createUser = async (
  data: Pick<User, "email" | "googleId">
): Promise<User> => {
  return await User.create(data).save();
};
