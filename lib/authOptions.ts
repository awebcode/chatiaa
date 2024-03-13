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
      await connectDb();
      const existingUser = await User.findOne({
        email: user?.email,
      });

      //same account with different provider
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
    },
    async jwt({ token, user }: any) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (user) {
        token.accessToken = user.access_token;
        token.id = user.id;
      }
      return Promise.resolve(token);
    },
    async session({ session, token }: any) {
      //   const existingUser = await clientPromise.user.findUnique({ where: { id: token.sub } });

      //   if (!existingUser) return token;

      //   token.image = existingUser.imageUrl;
      //   token.name = existingUser.username;
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.user.id = token.id;

      return session;
    },
  },
  debug: false,
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 7,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/error",
  },
};
