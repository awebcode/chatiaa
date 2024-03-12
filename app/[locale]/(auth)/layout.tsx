import { unstable_setRequestLocale } from "next-intl/server";
import { ReactNode } from "react";



export default async function AuthLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
 

  return (
      <div>
        {children} {/* <IntlPolyfills /> */}
      </div>
  );
}
