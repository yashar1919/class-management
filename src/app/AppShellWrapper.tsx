"use client";
import { usePathname } from "next/navigation";
import AppShell from "./AppShell";
import PwaRedirect from "./OnbordingRedirect";

export default function AppShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/onbording";

  // اگر صفحه لاگین، ثبت‌نام یا خوش‌آمد بود فقط children را نمایش بده
  return (
    <>
      <PwaRedirect />
      {isAuthPage ? <>{children}</> : <AppShell>{children}</AppShell>}
    </>
  );
}
