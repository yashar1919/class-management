import Image from "next/image";
import React from "react";
import Logo from "../../public/logo.png";
import {
  BookOutlined,
  CloseOutlined,
  FormOutlined,
  FundOutlined,
  InfoCircleOutlined,
  //LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";

const menuItems = [
  {
    id: "class",
    title: "Class Management",
    icon: <BookOutlined style={{ fontSize: "18px" }} />,
  },
  {
    id: "info",
    title: "Student Info",
    icon: <InfoCircleOutlined style={{ fontSize: "18px" }} />,
  },
  {
    id: "profile",
    title: "Profile",
    icon: <UserOutlined style={{ fontSize: "18px" }} />,
  },
  {
    id: "reports",
    title: "Reports",
    icon: <FundOutlined style={{ fontSize: "18px" }} />,
  },
  {
    id: "lessonPlan",
    title: "Lesson Plan",
    icon: <FormOutlined style={{ fontSize: "18px" }} />,
  },
];

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  // تشخیص موبایل با media query
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // اگر موبایل است و سایدبار بسته است فقط دکمه منو را نمایش بده
  if (isMobile && !isOpen) {
    return (
      <button
        className="fixed top-4 -left-2 z-50 p-3 bg-neutral-900 rounded-r-full shadow-lg border-r border-t border-b border-teal-500 text-teal-500"
        onClick={() => setIsOpen(true)}
      >
        <MenuOutlined style={{ fontSize: "24px" }} />
      </button>
    );
  }

  // اگر موبایل است و سایدبار باز است، سایدبار تمام‌صفحه و تارکننده پس‌زمینه
  if (isMobile && isOpen) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
        <aside
          className="fixed inset-0 z-50 bg-neutral-900 shadow-lg flex flex-col
        transition-transform duration-300
        transform translate-x-0
        animate-slidein"
        >
          <div className="flex items-center justify-end px-6 pt-5">
            <button
              onClick={() => setIsOpen(false)}
              className="text-teal-500 hover:text-gray-500 transition cursor-pointer"
            >
              <CloseOutlined style={{ fontSize: "24px" }} />
            </button>
          </div>
          <div className="flex justify-center">
            <Image src={Logo} width={250} alt="classco logo" />
          </div>
          <nav className="flex-1 flex flex-col items-center mt-10">
            <ul className="space-y-6 w-full px-8">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-center w-full px-6 py-4 rounded-2xl gap-4 text-lg justify-start transition-colors duration-200 cursor-pointer ${
                        isActive
                          ? "bg-teal-500 text-white shadow"
                          : "text-gray-200 hover:bg-teal-100"
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </>
    );
  }

  // حالت دسکتاپ
  {
    /* <aside
    className={`fixed top-3 left-3 bottom-3 h-auto z-50 bg-slate-800 shadow-lg border rounded-2xl border-teal-500 transition-all duration-300 ${
      isOpen ? "w-64" : "w-20"
    }`}
  > */
  }
  return (
    <aside
      className={`fixed top-3 left-3 bottom-3 h-auto z-50 bg-neutral-900 rounded-2xl transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
      style={{ boxShadow: "0px 0px 5px #008080" }}
    >
      {/* Logo & Toggle */}
      <div className="px-4 py-3">
        <div className={`${isOpen ? "hidden" : "block"} mb-3`}>
          <Image src={Logo} width={50} alt="classco logo" />
        </div>
        <div className={`flex ${isOpen ? "justify-end" : "justify-center"}`}>
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
      <nav className="mt-10">
        <ul className="space-y-3 px-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center ${
                    isOpen
                      ? "w-full px-5 py-2 rounded-lg"
                      : "mx-auto px-4 py-3 rounded-full"
                  } gap-4 transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? "bg-teal-500 text-white shadow"
                      : "text-gray-200 hover:bg-teal-100"
                  }`}
                >
                  <span>{item.icon}</span>
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
