 import createMiddleware from "next-intl/middleware";
import { locales, localePrefix } from "./navigation";
 import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";
// export default createMiddleware({
//   // A list of all locales that are supported

//   // Used when no locale matches
//   defaultLocale: "english",
//   localePrefix,
//   locales,
// });

// export const config = {
//   // Match only internationalized pathnames
//   matcher: [
//     "/",
//     "/(bangla|english|canada|china|france|germany|india|japan|russia)/:path*",
//   ],
// };
const publicPages=["/","/login","/register","/error"]
const intlMiddleware= createMiddleware({
  // A list of all locales that are supported

  // Used when no locale matches
  defaultLocale: "english",
  localePrefix,
  locales,
});

const authMiddleware = withAuth(
  // Note that this callback is only invoked if
  // the `authorized` callback has returned `true`
  // and not for pages listed in `pages`.
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export default function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join("|")}))?(${publicPages.join("|")})?/?$`,
    "i"
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return intlMiddleware(req);
  } else {
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
