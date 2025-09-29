import { ConfigProvider, Spin, theme } from "antd";
import React, { useEffect, useState } from "react";
import { LoadingOutlined, LogoutOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ModalCustom from "./UI/ModalCustom";

const Profile = () => {
  //eslint-disable-next-line
  const [user, setUser] = useState<any>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : "";
      if (!userId) return;
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
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
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }, 700);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
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
        <div className="bg-neutral-900 rounded-xl p-8 w-full max-w-md shadow-lg">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-gray-400 font-bold">
              {t("profile.fname")}:
            </span>
            <span className="text-teal-400 font-medium">{user.firstname}</span>
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
            <span className="text-teal-400 font-medium">{user.birthDate}</span>
          </div>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-transparent border border-red-500 hover:opacity-70 cursor-pointer text-red-500 font-semibold rounded-lg py-1.5 w-full transition-all duration-200 mt-12"
          >
            <LogoutOutlined />
            {t("sidebar.logout")}
          </button>
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
              <div className="text-center">
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
          </ConfigProvider>
        </div>
      )}
    </div>
  );
};

export default Profile;
