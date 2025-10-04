import Image from "next/image";
import React from "react";
import Logo from "../../public/logo.png";
import {
  BookOutlined,
  CloseOutlined,
  FormOutlined,
  FundOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ConfigProvider, Spin, theme, Input, notification } from "antd";
import ModalCustom from "./UI/ModalCustom";
//import { signOut } from "next-auth/react";

const MobileBottomNav = dynamic(() => import("./MobileBottomNav"), {
  ssr: false,
});

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  /* const handleLogout = () => {
    localStorage.removeItem("userId"); // Session cleanup - Keep for logout
    window.location.href = "/login";
  }; */

  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = React.useState(false);
  const [pendingRoute, setPendingRoute] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState("");
  const [api, contextHolder] = notification.useNotification();

  const handleLogout = async () => {
    setLoading(true);
    await fetch("/api/users/logout", { method: "POST" });
    // کمی تاخیر برای نمایش لودینگ (اختیاری)
    setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };

  //eslint-disable-next-line
  const handleMenuClick = (item: any) => {
    if (item.id === "reports" || item.id === "lesson-plan") {
      setPendingRoute(item.path); // مسیر مقصد را ذخیره کن
      setPremiumModalOpen(true);
    } else {
      router.push(item.path);
    }
  };

  const activeTab = pathname?.split("/")[1] || "class";

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const menuItems = [
    {
      id: "class",
      title: t("sidebar.classManagement"),
      icon: <BookOutlined style={{ fontSize: "18px" }} />,
      path: "/class",
    },
    {
      id: "info",
      title: t("sidebar.studentInfo"),
      icon: <InfoCircleOutlined style={{ fontSize: "18px" }} />,
      path: "/info",
    },
    {
      id: "profile",
      title: t("sidebar.profile"),
      icon: <UserOutlined style={{ fontSize: "18px" }} />,
      path: "/profile",
    },
    {
      id: "reports",
      title: t("sidebar.reports"),
      icon: <FundOutlined style={{ fontSize: "18px" }} />,
      lockIcon: <LockOutlined style={{ color: "#fb2c36", fontSize: "15px" }} />,
      path: "/reports",
    },
    {
      id: "lesson-plan",
      title: t("sidebar.lessonPlan"),
      icon: <FormOutlined style={{ fontSize: "18px" }} />,
      lockIcon: <LockOutlined style={{ color: "#fb2c36", fontSize: "15px" }} />,
      path: "/lesson-plan",
    },
    {
      id: "settings",
      title: t("sidebar.settings"),
      icon: <SettingOutlined style={{ fontSize: "18px" }} />,
      path: "/settings",
    },
  ];

  if (isMobile) {
    return (
      <>
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            const item = menuItems.find((i) => i.id === tab);
            if (item) router.push(item.path);
          }}
        />
      </>
    );
  }

  return (
    <>
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
        {contextHolder}
        {loading && (
          <div className="fixed inset-0 z-[9999] flex flex-col gap-7 items-center justify-center backdrop-blur-md bg-black/40">
            <Spin
              indicator={<LoadingOutlined spin />}
              size="large"
              style={{ color: "oklch(60% 0.118 184.704)", scale: 2 }}
            />
            <span className="text-teal-600 text-xl">Loading...</span>
          </div>
        )}
        <aside
          className={`fixed top-3 ${
            i18n.language === "fa" ? "right-3" : "left-3"
          } bottom-3 z-50 bg-neutral-900 rounded-2xl transition-all duration-300 ${
            isOpen ? "w-64" : "w-20"
          } flex flex-col`}
          style={{ boxShadow: "0px 0px 5px #33c9b9" }}
        >
          {/* Logo & Toggle */}
          <div className="px-4 py-3">
            <div className={`${isOpen ? "hidden" : "block"} mb-3`}>
              <Image src={Logo} width={50} alt="classco logo" />
            </div>
            <div
              className={`flex mb-2 ${isOpen ? "justify-end" : "justify-center"}`}
            >
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-teal-500 ${
                  isOpen ? "hover:text-gray-500" : "hover:text-teal-100"
                } transition cursor-pointer`}
              >
                {isOpen ? (
                  <CloseOutlined />
                ) : (
                  <MenuOutlined style={{ fontSize: "18px" }} />
                )}
              </button>
            </div>
            <div
              className={`${isOpen ? "block" : "hidden"} flex justify-center`}
            >
              <Image src={Logo} width={250} alt="classco logo" />
            </div>
          </div>

          {/* Content: منو + دکمه خروج جدا */}
          <div className="flex flex-col justify-between flex-1 px-2 pb-4">
            {/* منوی اصلی */}
            <ul className="space-y-3 mt-4">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const isLocked = !!item.lockIcon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item)}
                      className={`flex items-center relative
                      ${isOpen ? "w-full px-5 py-2 rounded-lg justify-start" : "mx-auto px-4 py-3 rounded-full justify-center"}
                      gap-4 transition-colors duration-200 cursor-pointer
                      ${
                        isActive
                          ? "bg-teal-500 text-neutral-900"
                          : "text-gray-300 hover:bg-teal-200 hover:text-teal-900"
                      }`}
                    >
                      {/* وقتی منو بسته است و آیتم قفل دارد فقط قفل را نمایش بده */}
                      {!isOpen && isLocked ? (
                        <span className="bg-red-950 rounded-full p-1">
                          {item.lockIcon}
                        </span>
                      ) : (
                        <>
                          {/* آیکون اصلی */}
                          <span
                            className={`transition-all duration-300 ${
                              !isOpen && isActive ? "scale-130" : undefined
                            }`}
                          >
                            {item.icon}
                          </span>
                          {/* عنوان */}
                          <span
                            className={`${isOpen ? "block" : "hidden"} font-medium`}
                          >
                            {item.title}
                          </span>
                          {/* آیکون قفل در انتهای دکمه (وقتی منو باز است و آیتم قفل دارد) */}
                          {isOpen && isLocked && (
                            <span className="ml-auto bg-red-950 rounded-full px-1.5 py-0.5">
                              {item.lockIcon}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* دکمه خروج — همیشه پایین */}
            <ul className="mt-auto">
              <li>
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  className={`flex items-center ${
                    isOpen
                      ? "w-full px-5 py-2 rounded-lg"
                      : "mx-auto px-4 py-3 rounded-full"
                  } gap-4 transition-colors duration-200 cursor-pointer text-red-400 hover:bg-red-100 hover:text-red-700`}
                >
                  <span>
                    <LogoutOutlined style={{ fontSize: "18px" }} />
                  </span>
                  <span
                    className={`${isOpen ? "block" : "hidden"} font-medium`}
                  >
                    Logout
                  </span>
                </button>
              </li>
            </ul>

            {/* مودال‌ها */}
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
              {/* مودال پریمیوم */}
              <ModalCustom
                open={premiumModalOpen}
                onCancel={() => {
                  setPremiumModalOpen(false);
                  setOtp("");
                }}
                title=""
                footer={null}
              >
                <div className="text-center px-8 py-6">
                  <div className="mb-4">
                    <span
                      className="inline-block bg-red-950 text-red-500 rounded-full px-4 py-2"
                      style={{ fontSize: 32 }}
                    >
                      <LockOutlined />
                    </span>
                  </div>
                  <p className="text-lg text-gray-200 font-semibold mb-2">
                    Premium Feature
                  </p>
                  <p className="text-gray-400 text-base mb-6">
                    This feature is available only for premium accounts. Please
                    enter your 4-digit premium code to unlock.
                  </p>
                  <Input.OTP
                    length={4}
                    type="text"
                    /* separator={
                      <span
                        className="bg-neutral-500"
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "1px",
                          verticalAlign: "middle",
                          borderRadius: "2px",
                          margin: "0 4px",
                        }}
                      />
                    } */
                    value={otp}
                    onChange={(val) =>
                      setOtp(Array.isArray(val) ? val.join("") : (val ?? ""))
                    }
                    onInput={(val) =>
                      setOtp(Array.isArray(val) ? val.join("") : (val ?? ""))
                    }
                    inputMode="numeric"
                    style={{ direction: "ltr" }}
                    autoFocus
                  />
                  <div className="flex justify-between items-center gap-3 mt-7">
                    <button
                      className="flex items-center justify-center bg-transparent border border-red-500 hover:opacity-70 cursor-pointer text-red-500 w-full font-semibold rounded-lg py-1.5 transition-all duration-200"
                      onClick={() => {
                        setPremiumModalOpen(false);
                        setOtp("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex items-center justify-center bg-teal-500 border border-teal-500 hover:opacity-70 text-white font-semibold rounded-lg py-1.5 w-full transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        if (otp === "9999") {
                          setPremiumModalOpen(false);
                          setOtp("");
                          api.success({
                            message: "Premium Unlocked",
                            description: "You have unlocked premium features!",
                            placement: "top",
                          });
                          if (pendingRoute) {
                            router.push(pendingRoute); // ریدایرکت به صفحه مورد نظر
                            setPendingRoute(null);
                          }
                        } else {
                          api.error({
                            message: "Invalid Code",
                            description: "The code you entered is incorrect.",
                            placement: "top",
                          });
                        }
                      }}
                    >
                      Unlock
                    </button>
                  </div>
                </div>
              </ModalCustom>
              {/* مودال تأیید لاگ‌اوت */}
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
                      disabled={loading}
                    >
                      انصراف
                    </button>
                    <button
                      className="bg-red-500 w-full text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
                      onClick={handleLogout}
                      disabled={loading}
                    >
                      خروج
                    </button>
                  </div>
                </div>
              </ModalCustom>
            </ConfigProvider>
          </div>
        </aside>
      </ConfigProvider>
    </>
  );
};

export default Sidebar;
