import { AuthOptions } from "next-auth";
import { User } from "../model/UserModel";
import connectDb from "./connectDb";
export const serverAuthOptions: AuthOptions = {
  providers: [],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (token) {
        token.id = token.id;
      }
      return Promise.resolve(token);
    },
    async session({ session, token }: any) {
      await connectDb();
      if (token) {
        session.user.id = token.id;
        session.accessToken = session.accessToken;

        const loggedUser = await User.findById(token.id);

        if (loggedUser) {
          session.user.role = loggedUser.role || "user";
        }
      }

      return session;
    },
  },
};
