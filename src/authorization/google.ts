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
        callbackURL: "/auth/google/callback",
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
            googleId: id,
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

  /**
   * Passport checks `req.connection.encrypted` to determine whether it is a
   * secure connection or not. As we are using Heroku this value will always be
   * `undefined`. Therefore, causing the redirect url protocol to be `http`
   * instead of `https`. This causes authentication to fail as `http` protocols
   * is not added to allowed production redirects.
   *
   * @see https://stackoverflow.com/a/20848306
   * @see https://console.cloud.google.com/apis/credentials/oauthclient/565564764822-at3vtio2nfb473l8cjo59oq36vo5cvop.apps.googleusercontent.com?project=overcast-e7298
   */
  app.enable("trust proxy");

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${process.env.FRONTEND_HOST}/login`,
    }),
    (req, res) => {
      setJWTCookie(res, (req as any).user);

      // redirect to frontend -> page
      res.redirect(`${process.env.FRONTEND_HOST}/login`);
    }
  );
};
