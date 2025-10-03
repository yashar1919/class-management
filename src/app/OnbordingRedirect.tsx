"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PwaRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // اگر کاربر ثبت‌نام نکرده و قبلاً خوش‌آمد را ندیده
    const isSignedUp = !!localStorage.getItem("isSignedUp"); // بعد از signup این مقدار را ست کن

    if (
      !isSignedUp &&
      pathname !== "/onbording" &&
      !localStorage.getItem("onboarding-shown")
    ) {
      router.replace("/onbording");
    }
  }, [pathname, router]);

  return null;
}
