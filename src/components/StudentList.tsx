"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import {
  DeleteOutlined,
  EditOutlined,
  TableOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ConfigProvider, theme, Spin } from "antd";
import { useStudentStore } from "../store/studentStore";
import { useTranslation } from "react-i18next";
import ModalCustom from "./UI/ModalCustom";
import i18n from "@/i18n";
import { fetchStudents, deleteStudentFromDB } from "@/services/studentService";
import type { Student } from "../store/studentStore";

// Lazy load CalendarTable for better performance
const CalendarTable = lazy(() => import("./CalendarTable"));

// Memoized StudentCard component for better performance
const StudentCard = memo(
  ({
    student,
    onEdit,
    onDelete,
    onShowCalendar,
    t,
  }: {
    student: Student;
    onEdit: (student: Student) => void;
    onDelete: (student: Student) => void;
    onShowCalendar: (student: Student) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: any;
  }) => {
    const handleEdit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(student);
      },
      [onEdit, student]
    );

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(student);
      },
      [onDelete, student]
    );

    const handleShowCalendar = useCallback(() => {
      onShowCalendar(student);
    }, [onShowCalendar, student]);

    const classDays = useCallback(() => {
      return (student.sessions ?? [])
        .map((s) =>
          new Date(s.date).toLocaleDateString("fa-IR", {
            weekday: "long",
          })
        )
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join("، ");
    }, [student.sessions]);

    return (
      <div
        key={student.mongoId || student.id}
        className="bg-gradient-to-br from-neutral-900 to-teal-950 rounded-2xl shadow-lg p-5 grid grid-cols-8 cursor-pointer hover:ring-1 hover:ring-teal-400 transition"
        onClick={handleShowCalendar}
      >
        <div className="flex flex-col col-span-7">
          <span className="font-bold text-lg text-teal-300 mb-5">
            {student.name}
          </span>
          <span>
            {student.classType === "online"
              ? t("studentForm.online")
              : t("studentForm.inPerson")}
          </span>
          <span>
            {t("studentList.classDays")}: {classDays()}
          </span>
          <span>
            {t("studentList.classDuration")}: {student.duration}{" "}
            {t("studentList.hour")}
          </span>
        </div>
        <div className="col-span-1 flex flex-col gap-2 justify-center items-end">
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white p-2 rounded-full flex items-center cursor-pointer hover:bg-blue-600"
          >
            <EditOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded-full flex items-center cursor-pointer hover:bg-red-600"
          >
            <DeleteOutlined style={{ fontSize: "20px" }} />
          </button>
          <button
            onClick={handleShowCalendar}
            className="bg-teal-600 text-white p-2 rounded-full flex items-center cursor-pointer hover:bg-teal-700"
          >
            <TableOutlined style={{ fontSize: "20px" }} />
          </button>
        </div>
      </div>
    );
  }
);

StudentCard.displayName = "StudentCard";

export default function StudentList({
  messageApi,
  onLoadingChange,
}: {
  //eslint-disable-next-line
  messageApi: any;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const students = useStudentStore((s) => s.students);
  const setStudents = useStudentStore((s) => s.setStudents);
  const setEditingStudent = useStudentStore((s) => s.setEditingStudent);
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true); // اضافه کردن state لودینگ

  /* useEffect(() => {
    setLoading(true);
    fetchStudents()
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch students error:", err);
        setLoading(false);
      });
  }, [setStudents]); */

  useEffect(() => {
    setLoading(true);
    onLoadingChange?.(true); // اعلام شروع لودینگ
    fetchStudents()
      .then((data) => {
        setStudents(data);
        setLoading(false);
        onLoadingChange?.(false); // اعلام پایان لودینگ
      })
      .catch((err) => {
        console.error("Fetch students error:", err);
        setLoading(false);
        onLoadingChange?.(false); // اعلام پایان لودینگ حتی در خطا
      });
  }, [setStudents, onLoadingChange]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  //eslint-disable-next-line
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  // مودال جدول جلسات
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  //eslint-disable-next-line
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const handleDeleteStudent = useCallback((student: Student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  }, []);

  const confirmDeleteStudent = useCallback(
    async (studentId: string, mongoId: string, name: string) => {
      try {
        await deleteStudentFromDB(mongoId);
        const students = await fetchStudents();
        setStudents(students);
        // نمایش پیام موفقیت با نام دانش‌آموز
        messageApi.open({
          type: "success",
          content: `Student "${name}" deleted successfully!`,
        });
      } catch (err) {
        console.error("API DELETE error:", err);
        messageApi.open({
          type: "error",
          content: "Failed to delete student.",
        });
      }
    },
    [messageApi, setStudents]
  );

  const handleEditStudent = useCallback(
    (student: Student) => {
      setEditingStudent(student);
    },
    [setEditingStudent]
  );

  const handleShowCalendar = useCallback((student: Student) => {
    setSelectedStudent(student);
    setCalendarModalOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-7 items-center justify-center my-20">
        <Spin
          indicator={<LoadingOutlined spin />}
          size="large"
          style={{ color: "oklch(60% 0.118 184.704)", scale: 1.5 }}
        />
        <span className="text-teal-600">
          Loading<span className="font-semibold mx-1">Students</span>...
        </span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-gray-500 text-center">
        No students have been added yet.
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[950px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {students.map((student) => (
          <StudentCard
            key={student.mongoId || student.id}
            student={student}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
            onShowCalendar={handleShowCalendar}
            t={t}
          />
        ))}

        {/* مودال جدول جلسات */}
        <ConfigProvider
          theme={{ algorithm: theme.darkAlgorithm, components: {} }}
        >
          <ModalCustom
            open={calendarModalOpen}
            onCancel={() => {
              setCalendarModalOpen(false);
              setSelectedStudent(null);
            }}
            title=""
            footer={null}
            width={1000}
          >
            {selectedStudent && (
              <div>
                <p className="text-teal-400 font-light text-2xl mb-5 mx-3">
                  {selectedStudent?.name || ""}
                </p>
                <Suspense
                  fallback={
                    <div className="flex justify-center py-8">
                      <Spin size="large" />
                    </div>
                  }
                >
                  <CalendarTable
                    studentId={selectedStudent.mongoId || selectedStudent.id}
                  />
                </Suspense>
              </div>
            )}
          </ModalCustom>
        </ConfigProvider>

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
                confirmDeleteStudent(
                  studentToDelete.id,
                  studentToDelete.mongoId,
                  studentToDelete.name
                );
              }
              setDeleteModalOpen(false);
              setStudentToDelete(null);
            }}
            title=""
            okText={t("studentList.delete") || "حذف"}
            cancelText={t("studentList.cancel") || "انصراف"}
            footer={null}
          >
            <div className="text-center px-8">
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
                  <span className="text-red-600 mx-1">
                    {studentToDelete?.name}
                  </span>
                  مطمئن هستید؟
                </p>
              ) : (
                <p className="text-[17px] font-light text-gray-400">
                  Are you sure you want to delete
                  <span className="text-red-600 font-medium mx-1">
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
                      confirmDeleteStudent(
                        studentToDelete.id,
                        studentToDelete.mongoId,
                        studentToDelete.name
                      );
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
    </>
  );
}
