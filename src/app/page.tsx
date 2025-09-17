"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import StudentForm from "../components/StudentForm";
import StudentList from "../components/StudentList";
import StudentsInfo from "../components/StudentsInfo";
import "../i18n";
import Settings from "@/components/Settings";
import Profile from "@/components/Profile";
import Reports from "@/components/Reports";
import LessonPlan from "@/components/LessonPlan";
import Logo from "../../public/logo.png";
import Image from "next/image";

export default function Home() {
  const [activeTab, setActiveTab] = useState("class");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { i18n } = useTranslation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // فقط در دسکتاپ فاصله بده
  const sidebarWidth = !isMobile ? (sidebarOpen ? 256 : 80) : 0;

  // تعیین جهت margin بر اساس زبان
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
    <div>
      {/* لوگو فقط در حالت موبایل و همیشه بالای صفحه */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 bg-zinc-800 flex justify-center z-50 pb-2"
          //style={{ minHeight: 56 }}
        >
          <Image src={Logo} width={150} alt="classco logo" />
        </div>
      )}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main
        className="transition-all duration-300"
        style={{
          ...mainStyle,
          paddingBottom: isMobile ? "7rem" : undefined, // اضافه کردن فضای خالی پایین فقط در موبایل
          paddingLeft: !isMobile && i18n.language !== "fa" ? 32 : undefined, // فاصله از چپ برای LTR
          paddingRight: !isMobile && i18n.language === "fa" ? 32 : undefined, // فاصله از راست برای RTL
        }}
      >
        <div
          className={`max-w-5xl mx-auto ${isMobile ? "mt-20" : "mt-3"} px-4`}
        >
          {activeTab === "class" && (
            <div>
              <StudentForm />
              <StudentList />
            </div>
          )}
          {activeTab === "info" && <StudentsInfo />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "lessonPlan" && <LessonPlan />}
          {activeTab === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}
