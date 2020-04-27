import "reflect-metadata";

import { ApolloServer } from "apollo-server";
import { TaskResolver } from "./resolvers/task";
import { UserResolver } from "./resolvers/user";
import { buildSchema } from "type-graphql";

// import cookieParser = require("cookie-parser");

/**
 * GraphQL server
 */
// const server = new GraphQLServer({
//   schema,
//   context: ({ request, response }): IContext => ({
//     url: request.protocol + "://" + request.get("host"),
//     req: request,
//     res: response
//   })
// });

// await createConnection();

// server.express.use(cookieParser());
// server.express.use(JWTMiddleware());

/**
 * Oauth
 * note: has to be under the above `await createConnection()`
 */
// useGoogleOauth(server);

/**
 * Cors
 */
// const cors = {
//   origin: [process.env.FRONTEND_HOST as string, "https://app.kaminote.io"],
//   credentials: true
// };

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: [TaskResolver, UserResolver],
    emitSchemaFile: true
  });

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
    playground: true
  });

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
