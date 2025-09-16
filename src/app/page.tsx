/* "use client";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import StudentForm from "../components/StudentForm";
import StudentList from "../components/StudentList";
import StudentsInfo from "../components/StudentsInfo";
import "../i18n";

export default function Home() {
  const [activeTab, setActiveTab] = useState("class");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // فقط در دسکتاپ فاصله بده
  const sidebarWidth = !isMobile ? (sidebarOpen ? 256 : 80) : 0;

  return (
    <div>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          minHeight: "90vh",
          width: !isMobile ? `calc(100% - ${sidebarWidth}px)` : "100%",
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
        </div>
      </main>
    </div>
  );
} */

"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import StudentForm from "../components/StudentForm";
import StudentList from "../components/StudentList";
import StudentsInfo from "../components/StudentsInfo";
import "../i18n";

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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="transition-all duration-300" style={mainStyle}>
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
        </div>
      </main>
    </div>
  );
}
