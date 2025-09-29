"use client";
import { useState } from "react";
import InputField from "@/components/UI/InputField";
import { Button, ConfigProvider, notification, theme } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrPhone?: string;
    password?: string;
    server?: string;
  }>({});
  const { t } = useTranslation();

  /* const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email)
      newErrors.email = t("login.emailRequired") || "ایمیل الزامی است";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = t("login.emailInvalid") || "ایمیل معتبر وارد کنید";
    if (!password)
      newErrors.password = t("login.passwordRequired") || "رمز عبور الزامی است";
    else if (password.length < 4)
      newErrors.password =
        t("login.passwordShort") || "رمز عبور باید حداقل ۴ کاراکتر باشد";
    return newErrors;
  }; */

  const [api, contextHolder] = notification.useNotification();
  const [notificationPlacement] = useState<
    "top" | "bottom" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
  >("top");

  const validate = () => {
    const newErrors: { emailOrPhone?: string; password?: string } = {};
    if (!emailOrPhone)
      newErrors.emailOrPhone = "ایمیل یا شماره موبایل الزامی است";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone) &&
      !/^09\d{9}$/.test(emailOrPhone)
    )
      newErrors.emailOrPhone = "ایمیل یا شماره موبایل معتبر وارد کنید";
    if (!password)
      newErrors.password = t("login.passwordRequired") || "رمز عبور الزامی است";
    else if (password.length < 4)
      newErrors.password =
        t("login.passwordShort") || "رمز عبور باید حداقل ۴ کاراکتر باشد";
    return newErrors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password }),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("userId", data.emailOrPhone);
        api.success({
          message: "Login Successful",
          description: "Welcome! You have logged in successfully.",
          placement: notificationPlacement,
        });
        setTimeout(() => {
          window.location.href = "/class";
        }, 1200);
      } else {
        const data = await res.json();
        api.error({
          message: "Login Error",
          description: data.error || "Login failed",
          placement: notificationPlacement,
        });
        //setErrors({ server: data.error || "Login failed" });
      }
    } catch (err) {
      console.log(err, "Signup error");
      api.error({
        message: "خطای سرور",
        description: "مشکلی در ارتباط با سرور رخ داده است.",
      });
      //setErrors({ server: "خطای سرور" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 to-neutral-900">
      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        {contextHolder}
        <form
          onSubmit={handleLogin}
          className="bg-[#141414] p-8 rounded-xl shadow-lg w-full max-w-[360px] sm:max-w-lg flex flex-col"
          noValidate
        >
          <h2 className="text-2xl font-bold text-teal-400 text-center mb-7">
            {t("login.login")}
          </h2>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              components: {
                Input: {
                  colorPrimary: "#00bba7",
                  algorithm: true,
                },
              },
            }}
          >
            <div className="flex flex-col gap-6 mb-7">
              <div>
                <InputField
                  placeholder={t("login.emailOrPhone")}
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  disabled={loading}
                  prefix={<UserOutlined />}
                  error={!!errors.emailOrPhone}
                />
                {errors.emailOrPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.emailOrPhone}
                  </p>
                )}
              </div>
              <div>
                <InputField
                  placeholder={t("studentForm.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  disabled={loading}
                  prefix={<LockOutlined />}
                  error={!!errors.password}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          </ConfigProvider>
          {errors.server && (
            <p className="text-red-500 text-xs mt-1 text-center">
              {errors.server}
            </p>
          )}
          <Button
            type="default"
            htmlType="submit"
            style={{
              background: "#00aa98",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 500,
              padding: "19px 0px",
              border: "none",
              width: "100%",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            loading={loading}
            disabled={loading}
          >
            {loading ? t("studentForm.loading") : t("login.login")}
          </Button>
          <div className="flex justify-center items-center gap-2 text-sm mt-3">
            <span className="text-gray-400">{t("login.dontHaveAccount")}</span>
            <Link
              href="/signup"
              className="text-teal-400 text-center hover:underline"
            >
              {t("login.signup")}
            </Link>
          </div>
        </form>
      </ConfigProvider>
    </div>
  );
}
