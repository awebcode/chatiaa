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
exports.POST = exports.GET = exports.authOptions = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const next_auth_1 = __importDefault(require("next-auth"));
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const github_1 = __importDefault(require("next-auth/providers/github"));
const google_1 = __importDefault(require("next-auth/providers/google"));
const mongodb_adapter_1 = require("@next-auth/mongodb-adapter");
const clientPromise_1 = __importDefault(require("./options/clientPromise"));
const connectDb_1 = __importDefault(require("../config/connectDb"));
const UserModel_1 = require("./options/models/UserModel");
const AccountModel_1 = __importDefault(require("./options/models/AccountModel"));
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
                yield (0, connectDb_1.default)();
                const existingUser = yield UserModel_1.User.findOne({
                    email: user === null || user === void 0 ? void 0 : user.email,
                });
                //same account with different provider
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
            });
        },
        jwt({ token, user }) {
            return __awaiter(this, void 0, void 0, function* () {
                // Persist the OAuth access_token and or the user id to the token right after signin
                if (user) {
                    token.accessToken = user.access_token;
                    token.id = user.id;
                }
                return Promise.resolve(token);
            });
        },
        session({ session, token }) {
            return __awaiter(this, void 0, void 0, function* () {
                //   const existingUser = await clientPromise.user.findUnique({ where: { id: token.sub } });
                //   if (!existingUser) return token;
                //   token.image = existingUser.imageUrl;
                //   token.name = existingUser.username;
                // Send properties to the client, like an access_token and user id from a provider.
                session.accessToken = token.accessToken;
                session.user.id = token.id;
                return session;
            });
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
const handler = (0, next_auth_1.default)(exports.authOptions);
exports.GET = handler;
exports.POST = handler;
