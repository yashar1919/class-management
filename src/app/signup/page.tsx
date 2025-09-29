"use client";
import { useState } from "react";
import InputField from "@/components/UI/InputField";
import DropdownField from "@/components/UI/DropdownField";
import PersianCalendarPicker from "@/components/UI/PersianCalendarPicker";
import { Button, ConfigProvider, theme } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { DateObject } from "react-multi-date-picker";

const genderOptionsPersian = [
  { key: "male", label: "مرد" },
  { key: "female", label: "زن" },
];

const genderOptionsEnglish = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

export default function SignupPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [gender, setGender] = useState<string>("");
  const [birthDate, setBirthDate] = useState<DateObject[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstname?: string;
    lastname?: string;
    emailOrPhone?: string;
    gender?: string;
    birthDate?: string;
    password?: string;
    confirmPassword?: string;
    server?: string;
  }>({});
  const { t, i18n } = useTranslation();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!firstname) newErrors.firstname = "نام الزامی است";
    if (!lastname) newErrors.lastname = "نام خانوادگی الزامی است";
    if (!emailOrPhone)
      newErrors.emailOrPhone = "ایمیل یا شماره موبایل الزامی است";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone) &&
      !/^09\d{9}$/.test(emailOrPhone)
    )
      newErrors.emailOrPhone = "ایمیل یا شماره موبایل معتبر وارد کنید";
    if (!gender) newErrors.gender = "جنسیت الزامی است";
    if (!birthDate.length) newErrors.birthDate = "تاریخ تولد الزامی است";
    if (!password) newErrors.password = "رمز عبور الزامی است";
    else if (password.length < 4)
      newErrors.password = "رمز عبور باید حداقل ۴ کاراکتر باشد";
    if (!confirmPassword)
      newErrors.confirmPassword = "تکرار رمز عبور الزامی است";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "رمز عبور و تکرار آن یکسان نیستند";
    return newErrors;
  };

  const handleSignup = async (e: React.FormEvent) => {
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          emailOrPhone,
          gender,
          birthDate: birthDate[0]?.format("YYYY/MM/DD"),
          password,
        }),
      });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        const data = await res.json();
        setErrors({ server: data.error || "ثبت‌نام ناموفق بود" });
      }
    } catch (err) {
      setErrors({ server: "خطای سرور" });
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 to-neutral-900">
      <form
        onSubmit={handleSignup}
        className="bg-[#141414] p-8 rounded-xl shadow-lg w-full max-w-[360px] sm:max-w-lg flex flex-col gap-6 my-20"
        noValidate
      >
        <h2 className="text-2xl font-bold text-teal-400 text-center mb-7">
          {t("signup.signup")}
        </h2>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Input: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
              Dropdown: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
            },
          }}
        >
          <div className="flex flex-col gap-5 mb-7">
            <div>
              <InputField
                placeholder={t("signup.fname")}
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                disabled={loading}
                prefix={<UserOutlined />}
                error={!!errors.firstname}
              />
              {errors.firstname && (
                <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
              )}
            </div>
            <div>
              <InputField
                placeholder={t("signup.lname")}
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                disabled={loading}
                prefix={<UserOutlined />}
                error={!!errors.lastname}
              />
              {errors.lastname && (
                <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
              )}
            </div>
            <div>
              <InputField
                placeholder={t("signup.emailOrPhone")}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                disabled={loading}
                prefix={<PhoneOutlined />}
                error={!!errors.emailOrPhone}
              />
              {errors.emailOrPhone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.emailOrPhone}
                </p>
              )}
            </div>
            <div>
              <DropdownField
                label={t("signup.gender")}
                items={
                  i18n.language === "fa"
                    ? genderOptionsPersian
                    : genderOptionsEnglish
                }
                value={gender}
                onChange={setGender}
                error={!!errors.gender}
                icon={<UserOutlined />}
              />
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>
            <div>
              <PersianCalendarPicker
                value={birthDate}
                onChange={setBirthDate}
                error={!!errors.birthDate}
                placeholder={t("signup.chooseBirthday")}
              />
              {errors.birthDate && (
                <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
              )}
            </div>
            <div>
              <InputField
                placeholder={t("signup.password")}
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
            <div>
              <InputField
                placeholder={t("signup.confirmPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                disabled={loading}
                prefix={<LockOutlined />}
                error={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
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
          {loading ? t("signup.loadingSignup") : t("signup.signup")}
        </Button>
        <div className="flex justify-center items-center gap-2 text-sm mt-3">
          <span className="text-gray-400">{t("signup.haveAccount")}</span>
          <Link
            href="/login"
            className="text-teal-400 text-center hover:underline"
          >
            {t("login.login")}
          </Link>
        </div>
      </form>
    </div>
  );
}
