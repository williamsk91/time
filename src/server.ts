import "reflect-metadata";

import { ApolloServer } from "apollo-server-express";
import { JWTMiddleware } from "./authorization/JWT";
import cookieParser from "cookie-parser";
import { createConnection } from "typeorm";
import { createSchema } from "./graphql/schema";
import express from "express";
import { useGoogleOauth } from "./authorization/google";

const PORT = process.env.PORT || 4000;

export interface PreAuthorizedContext {
  user: {
    id?: string;
  };
  req: express.Request;
  res: express.Response;
}

async function bootstrap() {
  await createConnection();
  const app = express();

  app.use(cookieParser());
  app.use(JWTMiddleware());

  useGoogleOauth(app);

  const schema = await createSchema();

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }): PreAuthorizedContext => {
      return {
        req,
        res,
        user: {
          id: req.userId,
        },
      };
    },
    introspection: true,
  });

  server.applyMiddleware({
    app,
    cors: {
      origin: process.env.FRONTEND_HOST as string,
      credentials: true,
    },
  });

  // Start the server
  app.listen({ port: PORT }, () =>
    console.log(
      `Server is running, GraphQL Playground available at http://localhost:${PORT}/graphql`
    )
  );
}

bootstrap();
