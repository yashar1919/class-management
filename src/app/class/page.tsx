"use client";

import { useEffect, useState } from "react";
import { ConfigProvider, notification, theme, message } from "antd";
import StudentForm from "@/components/StudentForm";
import StudentList from "@/components/StudentList";

export default function ClassPage() {
  const [api, notificationContextHolder] = notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();

  // کلید یکتا برای message لودینگ
  const loadingKey = "students-loading";

  // تابع هندل تغییر لودینگ
  const handleStudentListLoading = (loading: boolean) => {
    if (loading) {
      messageApi.open({
        key: loadingKey,
        type: "loading",
        content: "Loading students...",
        duration: 0,
      });
    } else {
      messageApi.destroy(loadingKey);
    }
  };

  const [, setFirstname] = useState<string>("");

  useEffect(() => {
    // فقط اگر تازه وارد شده یا رفرش کرده
    const showWelcome = () => {
      const shown = localStorage.getItem("welcome_shown"); // UI state - Keep for user experience
      if (!shown) {
        // گرفتن اطلاعات کاربر از API
        fetch("/api/users/me", { credentials: "include" })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.firstname) {
              setFirstname(data.firstname);
              api.info({
                message: `Hello, ${data.firstname}👋!`,
                description: "Welcome to the class management app.",
                placement: "top",
              });
            } else {
              api.info({
                message: "Hello👋!",
                description: "Welcome to the class management app.",
                placement: "top",
              });
            }
            localStorage.setItem("welcome_shown", "true"); // UI state - Keep for user experience
          });
      }
    };

    showWelcome();

    // هر بار که صفحه رفرش شود، welcome_shown پاک شود - UI state management
    window.addEventListener("beforeunload", () => {
      localStorage.removeItem("welcome_shown"); // UI state cleanup
    });

    // پاکسازی event listener هنگام unmount
    return () => {
      window.removeEventListener("beforeunload", () => {
        localStorage.removeItem("welcome_shown"); // UI state cleanup
      });
    };
    //eslint-disable-next-line
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      {notificationContextHolder}
      {messageContextHolder}
      <StudentForm />
      <StudentList
        messageApi={messageApi}
        onLoadingChange={handleStudentListLoading}
      />
    </ConfigProvider>
  );
}
