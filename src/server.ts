import "reflect-metadata";

import { ApolloServer } from "apollo-server";
import { createConnection } from "typeorm";
import { createSchema } from "./graphql/schema";

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

export interface Context {
  user: {
    id: string;
  };
}

async function bootstrap() {
  const schema = await createSchema();

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }): Context => {
      return {
        user: {
          id: "27ef2905-7469-49ca-9c4b-f95755e28652"
        }
      };
    },

    playground: true
  });

  await createConnection();

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
