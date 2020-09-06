import {
  Resolver,
  Authorized,
  Query,
  Arg,
  Ctx,
  ID,
  Mutation,
  InputType,
  Field,
} from "type-graphql";
import { List } from "../entity/list";
import { AuthorizedContext } from "../authorization/authChecker";
import { getRepository } from "typeorm";
import { ListNotFoundError, UserNotFoundError } from "../error";
import { User } from "../entity/user";
import { ListAuthorized } from "../decorator/authorization";

@InputType()
class CreateListInput implements Partial<List> {
  @Field()
  title: string;

  @Field({ nullable: true })
  color?: string;
}

@InputType({ description: "New list data" })
class UpdateListInput implements Partial<List> {
  @Field((_type) => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  color?: string;
}

@Resolver()
export class ListResolver {
  @Authorized()
  @Query((_returns) => List)
  async list(
    @Arg("id", () => ID) id: string,
    @Ctx() { user }: AuthorizedContext
  ): Promise<List> {
    const list = await getRepository(List)
      .createQueryBuilder("list")
      .leftJoin("list.user", "user")
      .where("list.id = :id", { id })
      .andWhere("user.id = :userId", { userId: user.id })
      .andWhere("list.deleted is NULL")
      .getOne();
    if (!list) throw ListNotFoundError;

    return list;
  }

  @Authorized()
  @Query((_returns) => [List])
  async lists(@Ctx() { user }: AuthorizedContext): Promise<List[]> {
    return getRepository(List)
      .createQueryBuilder("list")
      .leftJoin("list.user", "user")
      .where("user.id = :id", { id: user.id })
      .andWhere("list.deleted is NULL")
      .orderBy("list.updatedDate", "ASC")
      .getMany();
  }

  @Authorized()
  @Mutation((_return) => List)
  async createList(
    @Arg("list") list: CreateListInput,
    @Ctx() { user }: AuthorizedContext
  ): Promise<List> {
    return await createList(user.id, list);
  }

  @Authorized()
  @ListAuthorized()
  @Mutation((_returns) => List)
  async updateList(
    @Arg("list")
    list: UpdateListInput
  ): Promise<List> {
    return await updateList(list);
  }

  @Authorized()
  @ListAuthorized()
  @Mutation((_returns) => List)
  async deleteList(@Arg("listId", () => ID) listId: string): Promise<List> {
    return await deleteList(listId);
  }
}

// ------------------------- Business logic -------------------------

async function createList(
  userId: string,
  list: CreateListInput
): Promise<List> {
  const user = await User.getById(userId);
  if (!user) throw UserNotFoundError;

  const newList = List.create({ ...list, user });
  await newList.save();

  return newList;
}

async function updateList(list: UpdateListInput): Promise<List> {
  await List.update(list.id, list);
  const updatedList = await List.getById(list.id);
  if (!updatedList) throw ListNotFoundError;
  return updatedList;
}

async function deleteList(listId: string): Promise<List> {
  await List.update(listId, { deleted: new Date() });
  const updatedList = await List.getById(listId);
  if (!updatedList) throw ListNotFoundError;
  return updatedList;
}
