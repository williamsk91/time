import { gCall } from "../test-utils/gCall";
import { getConnection } from "typeorm";
import { testConn } from "../test-utils/testConn";

beforeAll(async () => {
  await testConn(true);
});
afterAll(async () => await getConnection().close());

it("me", async () => {
  const result = await gCall({
    source: meQuery
  });
  expect(result.data?.me.id).toBeDefined();
});

// ------------------------- GraphQL Sources -------------------------
const meQuery = `
  {
    me {
      id
    }
  }
  `;
