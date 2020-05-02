import { AuthChecker } from "type-graphql";
import { PreAuthorizedContext } from "../server";

export const authChecker: AuthChecker<PreAuthorizedContext> = ({ context }) => {
  if (!context.user.id) return false;
  return true;
};

export interface AuthorizedContext extends PreAuthorizedContext {
  user: {
    id: string;
  };
}
