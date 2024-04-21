import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/clientPromise";
import connectDb from "@/lib/connectDb";
import { User } from "@/lib/models/UserModel";
import AccountModel from "@/lib/models/AccountModel";
import { AuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },
      async authorize(credentials, req) {
        await connectDb();

        // console.log('authorize', { credentials });
        const userFound = await User.findOne({
          email: credentials?.email,
        }).select("+password");

        if (!userFound) {
          throw new Error("User doesn't exists! try using another user.");
        }

        const passwordMatch = await bcrypt.compare(
          credentials!.password,
          userFound.password
        );

        if (!passwordMatch) {
          throw new Error("Password mismatch!");
        }
        // console.log('authorize', { userFound });
        return userFound;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, credentials, profile, email }) {
      if (account?.provider === "credentials") {
        await connectDb();
        const existingUser = await User.findOne({
          email: user?.email,
        });
        const existingAccount = await AccountModel.findOne({
          $and: [
            { userId: existingUser?._id },
            { provider: { $ne: account?.provider } }, // Exclude the current provider
          ],
        });

        if (existingAccount) {
          // User with the same email but different provider found
          throw new Error("Provider misMatch. Try another provider!");
        }

        //   const existingUser = await getUserById(user.id);
        if (!existingUser) {
          throw new Error("User doesn't exists! try using another user.");
        }
        return true;
      } else {
        return true;
      }

      //same account with different provider
    },

    async jwt({ token, user }: any) {
      //  await connectDb();
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.accessToken = user.access_token;
        token.id = user.id;
      }
      return Promise.resolve(token);
    },
    async session({ session, token }: any) {
      await connectDb();
      if (token) {
        session.user._id = token.id;
        session.accessToken = token.accessToken;

        const loggedUser = await User.findById(token.id);

        if (loggedUser) {
          session.user.role = loggedUser.role || "user";
          session.user.bio = loggedUser.bio;
          session.user.lastActive = loggedUser.lastActive;
          session.accessToken = cookies().get(
            process.env.NODE_ENV === "production"
              ? "__Secure-next-auth.session-token"
              : "next-auth.session-token"
          )?.value;
        }
      }

      return session;
    },
  },
  debug: false,
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 1000 * 60 * 60 * 24 * 30, //expires at 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",

        secure: true,
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
};
