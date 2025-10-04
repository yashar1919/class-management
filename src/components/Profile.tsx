import { ConfigProvider, Spin, theme, Button, notification } from "antd";
import React, { useEffect, useState } from "react";
import {
  LoadingOutlined,
  LogoutOutlined,
  EditOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ModalCustom from "./UI/ModalCustom";
import InputField from "./UI/InputField";
import DropdownField from "./UI/DropdownField";
import PersianCalendarPicker from "./UI/PersianCalendarPicker";

const genderOptionsPersian = [
  { key: "male", label: "مرد" },
  { key: "female", label: "زن" },
];

const genderOptionsEnglish = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

const Profile = () => {
  //eslint-disable-next-line
  const [user, setUser] = useState<any>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { t, i18n } = useTranslation();
  const [api, contextHolder] = notification.useNotification();

  // Edit fields state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [gender, setGender] = useState<string>("");
  //eslint-disable-next-line
  const [birthDate, setBirthDate] = useState<any>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : ""; // Session data - Keep for authentication
      if (!userId) return;
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          // Set edit fields
          setFirstname(data.firstname || "");
          setLastname(data.lastname || "");
          setEmailOrPhone(data.emailOrPhone || "");
          setGender(data.gender || "");
          setBirthDate(data.birthDate ? [data.birthDate] : []);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    await fetch("/api/users/logout", { method: "POST" });
    setTimeout(() => {
      localStorage.removeItem("userId"); // Session cleanup - Keep for logout
      window.location.href = "/login";
    }, 700);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        localStorage.clear();
        window.location.href = "/signup";
      } else {
        setDeleting(false);
        api.error({
          message: "Delete Error",
          description: "Account deletion failed.",
          placement: "top",
        });
      }
    } catch {
      setDeleting(false);
      api.error({
        message: "Delete Error",
        description: "Server error",
        placement: "top",
      });
    }
  };

  // Edit validation
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!firstname) newErrors.firstname = "First name is required";
    if (!lastname) newErrors.lastname = "Last name is required";
    if (!emailOrPhone) newErrors.emailOrPhone = "Email or phone is required";
    else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone) &&
      !/^09\d{9}$/.test(emailOrPhone)
    )
      newErrors.emailOrPhone = "Enter a valid email or phone";
    if (!gender) newErrors.gender = "Gender is required";
    if (!birthDate.length) newErrors.birthDate = "Birth date is required";
    if (newPassword) {
      if (newPassword.length < 4)
        newErrors.newPassword = "Password must be at least 4 characters";
      if (newPassword !== confirmNewPassword)
        newErrors.confirmNewPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleEditSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setEditLoading(true);

    // تبدیل تاریخ تولد به رشته قابل خواندن
    let birthDateValue = birthDate[0];
    if (
      birthDateValue &&
      typeof birthDateValue === "object" &&
      birthDateValue.format
    ) {
      birthDateValue = birthDateValue.format("YYYY/MM/DD");
    }

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          emailOrPhone,
          gender,
          birthDate: birthDateValue,
          newPassword: newPassword ? newPassword : undefined,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setEditModalOpen(false);
        // Refresh user info
        const updated = await res.json();
        setUser(updated);
        api.success({
          message: "Profile Updated",
          description:
            "Your profile information has been updated successfully.",
          placement: "top",
        });
      } else {
        const data = await res.json();
        setErrors({ server: data.error || "Update failed!" });
        api.error({
          message: "Update Error",
          description: data.error || "Update failed!",
          placement: "top",
        });
      }
      //eslint-disable-next-line
    } catch (err) {
      setErrors({ server: "Server error" });
      api.error({
        message: "Update Error",
        description: "Server error",
        placement: "top",
      });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
        }}
      >
        {contextHolder}
        {loadingLogout && (
          <div className="fixed inset-0 z-[9999] flex flex-col gap-7 items-center justify-center backdrop-blur-md bg-black/40">
            <Spin
              indicator={<LoadingOutlined spin />}
              size="large"
              style={{ color: "oklch(60% 0.118 184.704)", scale: 2 }}
            />
            <span className="text-teal-600 text-xl">
              {t("studentForm.loading") || "Loading..."}
            </span>
          </div>
        )}
        <h1 className="text-3xl text-gray-300 font-bold mb-10">Profile</h1>
        {!user ? (
          <div className="flex flex-col gap-7 items-center justify-center mt-20">
            <Spin
              indicator={<LoadingOutlined spin />}
              size="large"
              style={{ color: "oklch(60% 0.118 184.704)", scale: 1.5 }}
            />
            <span className="text-teal-600">Loading...</span>
          </div>
        ) : (
          <div
            className="bg-neutral-900 rounded-xl p-8 w-full max-w-md shadow-lg"
            style={{ boxShadow: "0px 0px 7px gray" }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="text-gray-400 font-bold">
                {t("profile.fname")}:
              </span>
              <span className="text-teal-400 font-medium">
                {user.firstname}
              </span>
            </div>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-gray-400 font-bold">
                {t("profile.lname")}:
              </span>
              <span className="text-teal-400 font-medium">{user.lastname}</span>
            </div>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-gray-400 font-bold">
                {t("profile.username")}:
              </span>
              <span className="text-teal-400 font-medium">
                {user.emailOrPhone}
              </span>
            </div>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-gray-400 font-bold">
                {t("profile.gender")}:
              </span>
              <span className="text-teal-400 font-medium">
                {i18n.language === "fa"
                  ? user.gender === "male"
                    ? "مرد"
                    : "زن"
                  : user.gender === "male"
                    ? "Male"
                    : "Female"}
              </span>
            </div>
            <div className="mb-5 flex items-center gap-3">
              <span className="text-gray-400 font-bold">
                {t("profile.dateOfBirth")}:
              </span>
              <span className="text-teal-400 font-medium">
                {user.birthDate}
              </span>
            </div>
            <div className="flex flex-col justify-center gap-3 mt-10">
              <div>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center justify-center gap-2 border border-teal-500 hover:opacity-70 text-teal-500 font-semibold rounded-lg py-1.5 w-full transition-all duration-200 cursor-pointer"
                >
                  <EditOutlined />
                  Edit
                </button>
              </div>
              <div className="flex justify-between gap-2">
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-transparent border border-red-500 hover:opacity-70 cursor-pointer text-red-500 w-full font-semibold rounded-lg py-1.5 transition-all duration-200"
                >
                  <LogoutOutlined />
                  {t("sidebar.logout")}
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-transparent border border-gray-500 hover:opacity-70 cursor-pointer text-gray-400 w-full font-semibold rounded-lg py-1.5 transition-all duration-200"
                >
                  <LockOutlined />
                  Delete Account
                </button>
              </div>
            </div>
            {/* مودال تایید خروج */}
            <ConfigProvider
              theme={{
                algorithm: theme.darkAlgorithm,
                components: {
                  Button: {
                    colorPrimary: "#00bba7",
                    algorithm: true,
                  },
                },
              }}
            >
              <ModalCustom
                open={logoutModalOpen}
                onCancel={() => setLogoutModalOpen(false)}
                title=""
                footer={null}
              >
                <div className="text-center px-8">
                  <div className="mb-5">
                    <LogoutOutlined
                      style={{
                        fontSize: "40px",
                        color: "#fb2c36",
                        backgroundColor: "#460809",
                        borderRadius: "100%",
                        padding: "10px",
                      }}
                    />
                    <p className="text-white text-lg mt-1 font-semibold">
                      خروج از حساب کاربری
                    </p>
                  </div>
                  <p className="text-[17px] font-light text-gray-400">
                    آیا مطمئن هستید که می‌خواهید خارج شوید؟
                  </p>
                  <div className="flex justify-center gap-4 mt-7">
                    <button
                      className="border border-neutral-700 w-full text-gray-300 px-6 py-2 rounded-lg cursor-pointer"
                      onClick={() => setLogoutModalOpen(false)}
                      disabled={loadingLogout}
                    >
                      انصراف
                    </button>
                    <button
                      className="bg-red-500 w-full text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
                      onClick={handleLogout}
                      disabled={loadingLogout}
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </ModalCustom>
              {/* مودال ویرایش اطلاعات */}
              <ModalCustom
                open={editModalOpen}
                onCancel={() => setEditModalOpen(false)}
                title=""
                footer={null}
              >
                <form
                  className=""
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditSave();
                  }}
                >
                  <p className="text-teal-400 text-2xl font-semibold text-center mb-3">
                    Edit Modal
                  </p>
                  <div
                    className="flex flex-col gap-7 px-8 pt-5 bg-[#141414] space-y-0 text-base overflow-y-auto max-h-[50vh] sm:max-h-[70vh] [&::-webkit-scrollbar]:w-0.5
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                  >
                    <div className="flex flex-col gap-7">
                      <div>
                        <InputField
                          placeholder={t("signup.fname")}
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          disabled={editLoading}
                          prefix={<EditOutlined />}
                          error={!!errors.firstname}
                        />
                        {errors.firstname && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.firstname}
                          </p>
                        )}
                      </div>
                      <div>
                        <InputField
                          placeholder={t("signup.lname")}
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          disabled={editLoading}
                          prefix={<EditOutlined />}
                          error={!!errors.lastname}
                        />
                        {errors.lastname && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.lastname}
                          </p>
                        )}
                      </div>
                      <div>
                        <InputField
                          placeholder={t("signup.emailOrPhone")}
                          value={emailOrPhone}
                          onChange={(e) => setEmailOrPhone(e.target.value)}
                          disabled={editLoading}
                          prefix={<EditOutlined />}
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
                          icon={<EditOutlined />}
                        />
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.gender}
                          </p>
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
                          <p className="text-red-500 text-xs mt-1">
                            {errors.birthDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <InputField
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          type="password"
                          disabled={editLoading}
                          prefix={<LockOutlined />}
                          error={!!errors.newPassword}
                        />
                        {errors.newPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.newPassword}
                          </p>
                        )}
                      </div>
                      <div>
                        <InputField
                          placeholder="Confirm New Password"
                          value={confirmNewPassword}
                          onChange={(e) =>
                            setConfirmNewPassword(e.target.value)
                          }
                          type="password"
                          disabled={editLoading}
                          prefix={<LockOutlined />}
                          error={!!errors.confirmNewPassword}
                        />
                        {errors.confirmNewPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.confirmNewPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {isMobile ? (
                    <div className="px-8 my-3 flex flex-col justify-between gap-4">
                      <Button
                        htmlType="submit"
                        loading={editLoading}
                        style={{
                          background: "#00bba7",
                          color: "#fff",
                          borderRadius: "10px",
                          fontSize: "16px",
                          fontWeight: 500,
                          padding: "19px 0px",
                          border: "none",
                          width: "100%",
                          opacity: editLoading ? 0.7 : 1,
                          cursor: editLoading ? "not-allowed" : "pointer",
                          marginTop: 20,
                        }}
                        disabled={editLoading}
                      >
                        Save Changes
                      </Button>
                      <Button
                        type="default"
                        style={{
                          color: "#fb2c36",
                          borderRadius: "10px",
                          fontSize: "16px",
                          fontWeight: 500,
                          padding: "19px 0px",
                          border: "1px solid #fb2c36",
                          width: "100%",
                        }}
                        onClick={() => setEditModalOpen(false)}
                        disabled={editLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="px-8 my-3 flex justify-between gap-2 mt-10">
                      <Button
                        htmlType="submit"
                        loading={editLoading}
                        style={{
                          background: "#00bba7",
                          color: "#fff",
                          borderRadius: "10px",
                          fontSize: "16px",
                          fontWeight: 500,
                          padding: "19px 0px",
                          border: "none",
                          width: "100%",
                          opacity: editLoading ? 0.7 : 1,
                          cursor: editLoading ? "not-allowed" : "pointer",
                        }}
                        disabled={editLoading}
                      >
                        Save Changes
                      </Button>
                      <Button
                        type="default"
                        style={{
                          color: "#fb2c36",
                          borderRadius: "10px",
                          fontSize: "16px",
                          fontWeight: 500,
                          padding: "19px 0px",
                          border: "1px solid #fb2c36",
                          width: "100%",
                        }}
                        onClick={() => setEditModalOpen(false)}
                        disabled={editLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </ModalCustom>
              {/* مودال حذف حساب کاربری */}
              <ModalCustom
                open={deleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                title=""
                footer={null}
              >
                <div className="text-center px-8">
                  <div className="mb-5">
                    <LockOutlined
                      style={{
                        fontSize: "40px",
                        color: "#fb2c36",
                        backgroundColor: "#460809",
                        borderRadius: "100%",
                        padding: "10px",
                      }}
                    />
                    <p className="text-white text-lg mt-1 font-semibold">
                      حذف حساب کاربری
                    </p>
                  </div>
                  <p className="text-[17px] font-light text-gray-400">
                    آیا مطمئن هستید که می‌خواهید حساب کاربری خود را{" "}
                    <span className="text-red-400 font-bold">برای همیشه</span>{" "}
                    حذف کنید؟ این عملیات غیرقابل بازگشت است.
                  </p>
                  <div className="flex justify-center gap-4 mt-7">
                    <button
                      className="border border-neutral-700 w-full text-gray-300 px-6 py-2 rounded-lg cursor-pointer"
                      onClick={() => setDeleteModalOpen(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-red-500 w-full text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </ModalCustom>
            </ConfigProvider>
          </div>
        )}
      </ConfigProvider>
    </div>
  );
};

export default Profile;
