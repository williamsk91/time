import { createConnection } from "typeorm";

/**
 * Creates a test connection to test db
 */
export const testConn = (drop: boolean = false) => {
  return createConnection({
    type: "postgres",
    entities: [__dirname + "/../entity/**/*"],
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "timelog_test",
    synchronize: drop,
    dropSchema: drop
  });
};
