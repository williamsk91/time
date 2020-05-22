import { Express } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../entity/user";
import { createUser } from "../resolvers/user";
import { getConnection } from "typeorm";
import passport from "passport";
import { setJWTCookie } from "./JWT";

export const useGoogleOauth = (app: Express) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: "/auth/google/callback"
      },
      async (_accessToken, _refreshToken, profile, cb) => {
        const { id, emails } = profile;

        if (!emails) return cb("no email found");
        const email = emails[0].value;

        /**
         * Find user by `email` and `googleId`
         */
        const query = getConnection()
          .getRepository(User)
          .createQueryBuilder("user")
          .where("user.googleId = :id", { id })
          .orWhere("user.email = :email", { email });

        let user = await query.getOne();

        /**
         * User has been deleted
         */
        if (user?.deleted) {
          return cb(undefined, false, { messages: "deleted user" });
        }

        /**
         * Update user depending on user status
         */
        if (!user) {
          /** new user -> create user and a base page */
          user = await createUser({
            email,
            googleId: id
          });
        } else if (!user.googleId) {
          // known user first sign in
          // using google -> update googleId
          user.googleId = id;
          await user.save();
        }

        return cb(undefined, user);
      }
    )
  );

  app.use(passport.initialize());

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"]
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${process.env.FRONTEND_HOST}/login`
    }),
    (req, res) => {
      setJWTCookie(res, (req as any).user);

      // redirect to frontend -> page
      res.redirect(`${process.env.FRONTEND_HOST}/login`);
    }
  );
};
