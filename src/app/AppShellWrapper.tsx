"use client";
import { usePathname } from "next/navigation";
import AppShell from "./AppShell";

export default function AppShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // اگر صفحه لاگین یا ثبت‌نام بود فقط children را نمایش بده
  return isAuthPage ? <>{children}</> : <AppShell>{children}</AppShell>;
}
