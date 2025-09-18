import Image from "next/image";
import React from "react";
import Logo from "../../public/logo.png";
import {
  BookOutlined,
  CloseOutlined,
  FormOutlined,
  FundOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";

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
      path: "/reports",
    },
    {
      id: "lesson-plan",
      title: t("sidebar.lessonPlan"),
      icon: <FormOutlined style={{ fontSize: "18px" }} />,
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
    <aside
      className={`fixed top-3 ${
        i18n.language === "fa" ? "right-3" : "left-3"
      } left-3 bottom-3 h-auto z-50 bg-neutral-900 rounded-2xl transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
      style={{ boxShadow: "0px 0px 5px #008080" }}
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
        <div className={`${isOpen ? "block" : "hidden"} flex justify-center`}>
          <Image src={Logo} width={250} alt="classco logo" />
        </div>
      </div>

      {/* Menu */}
      <nav className={`${isOpen ? "mt-10" : "mt-4"}`}>
        <ul className="space-y-3 px-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`flex items-center ${
                    isOpen
                      ? "w-full px-5 py-2 rounded-lg"
                      : "mx-auto px-4 py-3 rounded-full"
                  } gap-4 transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "bg-teal-500 text-white shadow"
                      : "text-gray-200 hover:bg-teal-100 hover:text-gray-800"
                  }`}
                >
                  <span
                    className={`transition-all duration-300 ${
                      !isOpen && isActive ? "scale-130" : undefined
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`${isOpen ? "block" : "hidden"} font-medium`}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
