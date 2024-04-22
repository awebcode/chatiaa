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
exports.serverAuthOptions = void 0;
const UserModel_1 = require("../model/UserModel");
const connectDb_1 = __importDefault(require("./connectDb"));
exports.serverAuthOptions = {
    providers: [],
    callbacks: {
        jwt({ token, user, account }) {
            return __awaiter(this, void 0, void 0, function* () {
                if (token) {
                    token.id = token.id;
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
        maxAge: 1000 * 60 * 60 * 24 * 30, //expires at 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
