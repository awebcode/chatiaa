"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
const mongodb_1 = require("mongodb");
// if (!process.env.MONGODB) {
//   throw new Error('Invalid/Missing environment variable: "MONGODB"');
// }
console.log(process.env.MONGODB);
const uri = "mongodb+srv://Asikur:12345@cluster0.txiokqr.mongodb.net/Chatiaa";
const options = {};
let client;
let clientPromise;
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new mongodb_1.MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new mongodb_1.MongoClient(uri, options);
  clientPromise = client.connect();
}
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
exports.default = clientPromise;
