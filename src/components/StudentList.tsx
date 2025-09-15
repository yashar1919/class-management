"use client";
import React from "react";
import { CaretRightOutlined, DeleteOutlined } from "@ant-design/icons";
import type { CollapseProps } from "antd";
import { Collapse } from "antd";
import { useStudentStore } from "../store/studentStore";
import CalendarTable from "./CalendarTable";
import { useTranslation } from "react-i18next";

export default function StudentList() {
  const students = useStudentStore((s) => s.students);
  const removeStudent = useStudentStore((s) => s.removeStudent);
  const { t } = useTranslation();

  const weekDaysFa: Record<string, string> = {
    Sunday: t("studentList.sunday"),
    Monday: t("studentList.monday"),
    Tuesday: t("studentList.tuesday"),
    Wednesday: t("studentList.wednesday"),
    Thursday: t("studentList.thursday"),
    Friday: t("studentList.friday"),
    Saturday: t("studentList.saturday"),


    
  };

  function getWeekDayFa(date: Date) {
    const en = date.toLocaleDateString("en-US", { weekday: "long" });
    return weekDaysFa[en] || en;
  }

  if (students.length === 0)
    return (
      <div className="text-gray-500">No students have been added yet.</div>
    );

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: "#141414",
    borderRadius: 16,
    border: "none",
    color: "#fff",
    boxShadow: "0px 0px 5px gray",
  };

  const items: CollapseProps["items"] = students.map((student) => ({
    key: student.id,
    label: (
      <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between text-white">
        <span className="font-bold text-lg">{student.name}</span>
        <span className="text-sm">
          {student.classType === "Online"
            ? t("studentForm.online")
            : t("studentForm.offline")}
        </span>
        <span className="text-sm">
          {t("studentList.classDays")}:{" "}
          {student.sessions
            .map((s) => getWeekDayFa(new Date(s.date)))
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .join("، ")}
        </span>
        <span className="text-sm">
          {t("studentList.classDuration")}: {student.duration}{" "}
          {t("studentList.hour")}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeStudent(student.id);
          }}
          className="bg-red-500 text-white px-2 py-2 rounded-lg flex justify-center items-center cursor-pointer hover:bg-red-600"
        >
          <DeleteOutlined style={{ fontSize: "20px" }} />
        </button>
      </div>
    ),
    children: (
      <div className="px-3 pb-4 bg-[#141414] rounded-b-2xl">
        <CalendarTable student={student} />
      </div>
    ),
    style: panelStyle,
  }));

  return (
    <div className="max-w-[950px] mx-auto">
      <Collapse
        bordered={false}
        defaultActiveKey={[]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ color: "#fff" }}
            rotate={isActive ? 90 : 0}
          />
        )}
        style={{ background: "transparent" }}
        items={items}
        className=""
      />
    </div>
  );
}
