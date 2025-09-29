"use client";

import { useEffect, useState } from "react";
import { ConfigProvider, notification, theme } from "antd";
import StudentForm from "@/components/StudentForm";
import StudentList from "@/components/StudentList";

export default function ClassPage() {
  const [api, contextHolder] = notification.useNotification();
  const [, setFirstname] = useState<string>("");

  useEffect(() => {
    // گرفتن اطلاعات کاربر از API
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setFirstname(data.firstname || "");
          api.info({
            message: `Hello, ${data.firstname}👋!`,
            description: "Welcome to the class management app.",
            placement: "topRight",
          });
        }
      } catch {
        api.info({
          message: "Hello!",
          description: "Welcome to the class management app.",
          placement: "topRight",
        });
      }
    };
    fetchUser();
    //eslint-disable-next-line
  }, []);

  return (
    <>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        {contextHolder}
        <StudentForm />
        <StudentList />
      </ConfigProvider>
    </>
  );
}
