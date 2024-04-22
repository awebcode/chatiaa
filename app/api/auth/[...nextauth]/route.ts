export const maxDuration = 10; // 5 seconds
export const dynamic = "force-dynamic";
// export const runtime = "edge";
import { authOptions } from "@/lib/authOptions";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
