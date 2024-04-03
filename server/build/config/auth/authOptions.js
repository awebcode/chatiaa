"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const github_1 = __importDefault(require("next-auth/providers/github"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const mongodb_adapter_1 = require("@next-auth/mongodb-adapter");
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = require("../../model/UserModel");
const AccountModel_1 = __importDefault(require("../../model/AccountModel"));
const clientPromise_1 = __importDefault(require("./clientPromise"));
const connectDb_1 = __importDefault(require("../connectDb"));
exports.authOptions = {
    adapter: (0, mongodb_adapter_1.MongoDBAdapter)(clientPromise_1.default),
    providers: [
        (0, github_1.default)({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        (0, google_1.default)({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        (0, credentials_1.default)({
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
            authorize(credentials, req) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, connectDb_1.default)();
                    // console.log('authorize', { credentials });
                    const userFound = yield UserModel_1.User.findOne({
                        email: credentials === null || credentials === void 0 ? void 0 : credentials.email,
                    }).select("+password");
                    if (!userFound) {
                        throw new Error("User doesn't exists! try using another user.");
                    }
                    const passwordMatch = yield bcrypt_1.default.compare(credentials.password, userFound.password);
                    if (!passwordMatch) {
                        throw new Error("Password mismatch!");
                    }
                    // console.log('authorize', { userFound });
                    return userFound;
                });
            },
        }),
    ],
    callbacks: {
        signIn({ user, account, credentials, profile, email }) {
            return __awaiter(this, void 0, void 0, function* () {
                if ((account === null || account === void 0 ? void 0 : account.provider) === "credentials") {
                    yield (0, connectDb_1.default)();
                    const existingUser = yield UserModel_1.User.findOne({
                        email: user === null || user === void 0 ? void 0 : user.email,
                    });
                    const existingAccount = yield AccountModel_1.default.findOne({
                        $and: [
                            { userId: existingUser === null || existingUser === void 0 ? void 0 : existingUser._id },
                            { provider: { $ne: account === null || account === void 0 ? void 0 : account.provider } }, // Exclude the current provider
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
                }
                else {
                    return true;
                }
                //same account with different provider
            });
        },
        jwt({ token, user, account, profile, trigger, isNewUser, session }) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log({ token, user, account, profile, trigger, isNewUser, session });
                //  await connectDb();
                // Persist the OAuth access_token and or the user id to the token right after signin
                if (account) {
                    token.accessToken = account.access_token;
                    if (user) {
                        token.id = user.id;
                    }
                }
                return Promise.resolve(token);
            });
        },
        session({ session, token }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, connectDb_1.default)();
                if (token) {
                    session.user.id = token.id;
                    session.accessToken = session.accessToken;
                    const loggedUser = yield UserModel_1.User.findById(token.id);
                    if (loggedUser) {
                        session.user.role = loggedUser.role || "user";
                    }
                }
                return session;
            });
        },
    },
    debug: false,
    session: {
        strategy: "jwt",
    },
    jwt: {
        maxAge: 60 * 60 * 24 * 5, //expires at 5 days 24 hour
    },
    secret: process.env.NEXTAUTH_SECRET,
    // cookies: {
    //   sessionToken: {
    //     name: `__Secure-next-auth.session-token`,
    //     options: {
    //       expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
    //       secure: true,
    //       sameSite: "none",
    //       httpOnly: true,
    //     },
    //   },
    // },
    pages: {
        signIn: "/login",
        error: "/error",
    },
};
