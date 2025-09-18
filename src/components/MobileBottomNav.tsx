import React from "react";
import {
  BookOutlined,
  InfoCircleOutlined,
  FundOutlined,
  SettingOutlined,
} from "@ant-design/icons";
//import { useTranslation } from "react-i18next";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const navItems = [
  {
    id: "class",
    icon: <BookOutlined style={{ fontSize: 22 }} />,
    labelKey: "sidebar.classManagement",
  },
  {
    id: "info",
    icon: <InfoCircleOutlined style={{ fontSize: 22 }} />,
    labelKey: "sidebar.studentInfo",
  },
  {
    id: "reports",
    icon: <FundOutlined style={{ fontSize: 22 }} />,
    labelKey: "sidebar.reports",
  },
  {
    id: "settings",
    icon: <SettingOutlined style={{ fontSize: 22 }} />,
    labelKey: "sidebar.settings",
  },
];

const MobileBottomNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  //const { t } = useTranslation();

  return (
    <nav
      className="fixed bottom-5 left-0 right-0 z-50 bg-neutral-900 border-t border-gray-800 flex justify-around items-center h-16 md:hidden rounded-full mx-5"
      style={{ boxShadow: "0px 0px 15px #084848" }}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center justify-center relative p-3 transition-all duration-200"
          >
            <span
              className={`
                absolute inset-0 mx-auto my-auto
                rounded-full
                transition-all duration-300
                ${
                  isActive
                    ? "scale-115 bg-teal-900 opacity-100"
                    : "scale-75 bg-transparent opacity-0"
                }
              `}
              style={{ zIndex: 1 }}
            ></span>
            <span
              className={`
                relative flex items-center justify-center
                transition-all duration-300
                ${
                  isActive
                    ? "text-teal-400 scale-130"
                    : "text-gray-500 scale-100"
                }
              `}
              style={{ zIndex: 2 }}
            >
              {item.icon}
            </span>
            {/* <span className="text-xs mt-1 font-medium">{t(item.labelKey)}</span> */}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
