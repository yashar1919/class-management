"use client";
import React from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import type { CollapseProps } from "antd";
import { Collapse } from "antd";
import { useStudentStore } from "../store/studentStore";
import CalendarTable from "./CalendarTable";

const weekDaysFa: Record<string, string> = {
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنج‌شنبه",
  Friday: "جمعه",
  Saturday: "شنبه",
};

function getWeekDayFa(date: Date) {
  const en = date.toLocaleDateString("en-US", { weekday: "long" });
  return weekDaysFa[en] || en;
}

export default function StudentList() {
  const students = useStudentStore((s) => s.students);
  const removeStudent = useStudentStore((s) => s.removeStudent);

  if (students.length === 0)
    return (
      <div className="text-gray-500">No students have been added yet.</div>
    );

  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: "#2563eb",
    borderRadius: 16,
    border: "none",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  const items: CollapseProps["items"] = students.map((student) => ({
    key: student.id,
    label: (
      <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
        <span className="font-bold text-lg">{student.name}</span>
        <span className="text-sm">
          {student.classType === "online" ? "آنلاین" : "حضوری"}
        </span>
        <span className="text-sm">
          روزهای کلاس:{" "}
          {student.sessions
            .map((s) => getWeekDayFa(new Date(s.date)))
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .join("، ")}
        </span>
        <span className="text-sm">مدت کلاس: {student.duration} ساعت</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeStudent(student.id);
          }}
          className="bg-red-400 text-white px-2 py-1 rounded"
        >
          حذف
        </button>
      </div>
    ),
    children: (
      <div className="p-2 bg-blue-500 rounded-b-lg">
        <CalendarTable student={student} />
      </div>
    ),
    style: panelStyle,
  }));

  return (
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
  );
}
