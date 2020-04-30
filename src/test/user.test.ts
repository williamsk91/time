import { Connection } from "typeorm";
import { gCall } from "../test-utils/gCall";
import { testConn } from "../test-utils/testConn";

let conn: Connection;
beforeAll(async () => {
  conn = await testConn(true);
});

afterAll(async () => await conn.close());

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
