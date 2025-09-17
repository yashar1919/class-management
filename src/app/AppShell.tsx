"use client";
import { useState, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/Sidebar";
import Logo from "../../public/logo.png";
import Image from "next/image";
import DirectionManager from "./DirectionManager";
import I18nCustomProvider from "./providers/I18nCustomProvider";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  //const [activeTab, setActiveTab] = useState("class");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarWidth = !isMobile ? (sidebarOpen ? 256 : 80) : 0;

  const mainStyle =
    i18n.language === "fa"
      ? {
          marginRight: sidebarWidth,
          marginLeft: 0,
          minHeight: "90vh",
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : "100%",
        }
      : {
          marginLeft: sidebarWidth,
          marginRight: 0,
          minHeight: "90vh",
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : "100%",
        };

  return (
    <I18nCustomProvider>
      {/* لوگو فقط در حالت موبایل و همیشه بالای صفحه */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-zinc-800 flex justify-center z-50 pb-2">
          <Image src={Logo} width={150} alt="classco logo" />
        </div>
      )}
      <Sidebar
        //activeTab={activeTab}
        //setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main
        className="transition-all duration-300"
        style={{
          ...mainStyle,
          paddingBottom: isMobile ? "7rem" : undefined,
          paddingLeft: !isMobile && i18n.language !== "fa" ? 32 : undefined,
          paddingRight: !isMobile && i18n.language === "fa" ? 32 : undefined,
        }}
      >
        <div
          className={`max-w-5xl mx-auto ${isMobile ? "mt-20" : "mt-3"} px-4`}
        >
          <DirectionManager />
          {children}
        </div>
      </main>
    </I18nCustomProvider>
  );
}
