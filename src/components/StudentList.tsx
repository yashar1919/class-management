"use client";
import React, { useState } from "react";
import {
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { CollapseProps } from "antd";
import { Collapse, ConfigProvider, theme } from "antd";
import { useStudentStore } from "../store/studentStore";
import CalendarTable from "./CalendarTable";
import { useTranslation } from "react-i18next";
import ModalCustom from "./UI/ModalCustom";
import i18n from "@/i18n";

export default function StudentList() {
  const students = useStudentStore((s) => s.students);
  const removeStudent = useStudentStore((s) => s.removeStudent);
  const setEditingStudent = useStudentStore((s) => s.setEditingStudent);
  const { t } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  //eslint-disable-next-line
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

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
      <div className="flex flex-col md:flex-row md:items-center p-2 justify-between text-white sm:bg-none bg-gradient-to-br from-neutral-900 to-teal-950 rounded-lg">
        <div className="flex justify-between items-center sm:hidden">
          {/* For Mobile */}
          <span className="font-bold text-[22px] text-teal-100 pt-1 -mt-3 sm:hidden block">
            {student.name}
          </span>
          {/* For Mobile */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingStudent(student);
              }}
              className="bg-sky-700 text-white px-2 py-1.5 rounded-md flex justify-center items-center cursor-pointer sm:hidden"
            >
              <EditOutlined style={{ fontSize: "20px" }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStudentToDelete(student);
                setDeleteModalOpen(true);
              }}
              className="bg-red-700 text-white px-2 py-1.5 rounded-md flex justify-center items-center cursor-pointer sm:hidden"
            >
              <DeleteOutlined style={{ fontSize: "20px" }} />
            </button>
          </div>
        </div>

        {/* For Desktop */}
        <span className="font-bold text-lg text-teal-300 sm:block hidden">
          {student.name}
        </span>

        {/* For Mobile */}
        <div className="sm:hidden flex flex-col gap-0.5 mt-2">
          <span className="text-sm flex items-center justify-between bg-white/10 backdrop-blur rounded-md px-2 py-1">
            <span>
              {student.classType === "online"
                ? t("studentForm.online")
                : t("studentForm.inPerson")}
            </span>
            <span>
              <span className="sm:block hidden">
                {t("studentList.classDuration")}:{" "}
              </span>
              {student.duration} {t("studentList.hour")}
            </span>
          </span>
          <span className="text-[13px] flex gap-1 items-center bg-white/10 backdrop-blur rounded-md px-2 py-1">
            <span className="sm:block hidden">
              {t("studentList.classDays")}:{" "}
            </span>
            {student.sessions
              .map((s) => getWeekDayFa(new Date(s.date)))
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .join("، ")}
          </span>
        </div>

        {/* For Desktop */}
        <span className="text-sm sm:flex hidden">
          {student.classType === "online"
            ? t("studentForm.online")
            : t("studentForm.inPerson")}
        </span>
        <span className="text-sm sm:flex gap-1 hidden">
          <span className="sm:block hidden">
            {t("studentList.classDays")}:{" "}
          </span>
          {student.sessions
            .map((s) => getWeekDayFa(new Date(s.date)))
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .join("، ")}
        </span>
        <span className="text-sm sm:flex gap-1 hidden">
          <span className="sm:block hidden">
            {t("studentList.classDuration")}:{" "}
          </span>
          {student.duration} {t("studentList.hour")}
        </span>

        <div className="flex gap-2">
          {/* For Desktop */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingStudent(student);
            }}
            className="bg-blue-500 w-full text-white px-2 py-2 rounded-lg sm:flex justify-center items-center cursor-pointer hover:bg-blue-600 hidden"
          >
            <EditOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStudentToDelete(student);
              setDeleteModalOpen(true);
            }}
            className="bg-red-500 w-full text-white px-2 py-2 rounded-lg sm:flex justify-center items-center cursor-pointer hover:bg-red-600 hidden"
          >
            <DeleteOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
      </div>
    ),
    children: (
      <div className=" bg-[#141414] rounded-b-2xl">
        <CalendarTable student={student} />
      </div>
    ),
    style: panelStyle,
  }));

  return (
    <div className="max-w-[950px] mx-auto">
      {/* <Collapse
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
      /> */}
      <Collapse
        bordered={false}
        defaultActiveKey={[]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{
              color: "#fff",
              fontSize: 12,
              marginRight: 0,
              marginLeft: 0,
              alignSelf: "center",
            }}
            rotate={isActive ? 90 : 0}
          />
        )}
        expandIconPosition="start" // یا "end" بسته به نیازت
        style={{ background: "transparent" }}
        items={items}
        className="custom-collapse"
      />
      {/* Modal for delete confirmation */}
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
          open={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setStudentToDelete(null);
          }}
          onOk={() => {
            if (studentToDelete) {
              removeStudent(studentToDelete.id);
            }
            setDeleteModalOpen(false);
            setStudentToDelete(null);
          }}
          title=""
          okText={t("studentList.delete") || "حذف"}
          cancelText={t("studentList.cancel") || "انصراف"}
          footer={null}
        >
          <div className="text-center">
            <div className="mb-5">
              <DeleteOutlined
                style={{
                  fontSize: "40px",
                  color: "#fb2c36",
                  backgroundColor: "#460809",
                  borderRadius: "100%",
                  padding: "10px",
                }}
              />
              <p className="text-white text-lg mt-1 font-semibold">
                {t("studentList.deleteTitle")}
              </p>
            </div>
            {i18n.language === "fa" ? (
              <p className="text-[17px] font-light text-gray-400">
                آیا از حذف کردن
                <span className={`text-red-600 mx-1`}>
                  {studentToDelete?.name}
                </span>
                مطمئن هستید؟
              </p>
            ) : (
              <p className="text-[17px] font-light text-gray-400">
                Are you sure you want to delete
                <span className={`text-red-600 font-medium mx-1`}>
                  {studentToDelete?.name}
                </span>
                ?
              </p>
            )}
            <div className="flex justify-center gap-4 mt-7">
              <button
                className="border border-neutral-700 w-full text-gray-300 px-6 py-2 rounded-lg cursor-pointer"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setStudentToDelete(null);
                }}
              >
                {t("studentForm.cancel") || "Cancel"}
              </button>
              <button
                className="bg-red-500 w-full text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
                onClick={() => {
                  if (studentToDelete) {
                    removeStudent(studentToDelete.id);
                  }
                  setDeleteModalOpen(false);
                  setStudentToDelete(null);
                }}
              >
                {t("studentList.delete") || "Delete"}
              </button>
            </div>
          </div>
        </ModalCustom>
      </ConfigProvider>
    </div>
  );
}
