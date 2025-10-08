import React, { useMemo, useEffect, useState } from "react";
import {
  Table,
  Tag,
  ConfigProvider,
  theme,
  Button,
  notification,
  Input,
} from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useStudentStore } from "../store/studentStore";
import { useTranslation } from "react-i18next";
import ModalCustom from "./UI/ModalCustom";

const { TextArea } = Input;

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

function getWeekDayEn(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

type CalendarTableProps = {
  //student: Student;
  studentId: string;
};

interface SessionRow {
  key: string;
  session: number;
  date: string;
  weekday: string;
  startTime: string;
  endTime: string;
  attended: boolean;
  absent?: boolean;
  price: string | number;
  deposit: React.ReactNode;
}

export default function CalendarTable({ studentId }: CalendarTableProps) {
  const student = useStudentStore((s) =>
    s.students.find((stu) => stu.id === studentId || stu.mongoId === studentId)
  );

  const toggleAttendance = useStudentStore((s) => s.toggleAttendance);
  const toggleAbsent = useStudentStore((s) => s.toggleAbsent);
  const { t, i18n } = useTranslation();

  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);

  const defaultSmsText = student
    ? `${student.name} عزیز، زمان پرداخت شهریه کلاس شما فرا رسیده است. لطفا جهت ادامه جلسات، پرداخت را انجام دهید.`
    : "";

  // مقدار اولیه smsText با متن دیفالت
  const [smsText, setSmsText] = useState(defaultSmsText);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // هر بار student تغییر کرد، مقدار smsText را با متن دیفالت مقداردهی کن
    setSmsText(defaultSmsText);
  }, [defaultSmsText]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const data: SessionRow[] = useMemo(() => {
    if (!student || !student.sessions) return [];
    // Sort sessions by date ascending
    const sortedSessions = [...student.sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedSessions.map((session, idx) => ({
      key: session.id,
      session: idx + 1,
      date: new Date(session.date).toLocaleDateString("fa-IR"),
      /* date: new Date(session.date).toLocaleDateString(
        i18n.language === "fa" ? "fa-IR" : "en-US"
      ), */
      weekday:
        i18n.language === "fa"
          ? getWeekDayFa(new Date(session.date))
          : getWeekDayEn(new Date(session.date)),
      startTime: session.startTime,
      endTime: session.endTime,
      attended: session.attended,
      absent: session.absent,
      price: session.price,
      deposit:
        student && idx + 1 > (student.daysPerWeek ?? 1) * 4 ? (
          <Tag color="yellow" className="tag-xs">
            {t("table.tuitionRequired")}
          </Tag>
        ) : (
          <Tag color="green" className="tag-xs">
            {t("table.tuitionDone")}
          </Tag>
        ),
    }));
  }, [student, i18n.language, t]);

  useEffect(() => {
    // فقط جلساتی که پرداخت شده‌اند (تگ سبز دارند)
    const paidRows = data.filter((row, idx) => {
      return student && idx + 1 <= (student.daysPerWeek ?? 1) * 4;
    });

    // آیا همه جلسات پرداخت شده attended=true هستند؟
    const allPaidAttended = paidRows.every((row) => row.attended);

    if (paidRows.length > 0 && allPaidAttended && student) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [data, student]);

  const handleSendSMS = async () => {
    if (!student) return;
    setSendingSMS(true);
    try {
      const res = await fetch("/api/payment-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          phone: student.phone,
          customText: smsText.trim() ? smsText : defaultSmsText,
        }),
      });
      const result = await res.json();
      if (result.success) {
        api.success({
          message: "ارسال شد",
          description: "پیامک پرداخت با موفقیت ارسال شد.",
          placement: "top",
        });
      } else {
        api.error({
          message: "خطا",
          description: "ارسال پیامک با خطا مواجه شد.",
          placement: "top",
        });
      }
      //eslint-disable-next-line
    } catch (err) {
      api.error({
        message: "خطا",
        description: "ارسال پیامک با خطا مواجه شد.",
        placement: "top",
      });
    } finally {
      setSendingSMS(false);
      setIsModalOpen(false);
      setSmsText(""); // پاک کردن متن بعد از ارسال
    }
  };

  const selectedRowKeys = useMemo(
    () => data.filter((row) => row.attended).map((row) => row.key),
    [data]
  );

  const columns: ColumnsType<SessionRow> = useMemo(() => {
    const baseColumns: ColumnsType<SessionRow> = [
      {
        title: t("table.absent") || "Absent",
        dataIndex: "absent",
        key: "absent",
        align: "center",
        width: 50,
        render: (_: unknown, record: SessionRow) => (
          <span
            className="flex items-center justify-center"
            style={{ minHeight: 24 }}
          >
            <input
              type="checkbox"
              checked={!!record.absent}
              onChange={() => {
                if (!student) return;
                if (!record.absent) {
                  if (record.attended) toggleAttendance(student.id, record.key);
                }
                toggleAbsent(student.id, record.key);
              }}
              className="accent-red-500 w-5 h-5"
              style={{ display: "none" }}
              id={`absent-checkbox-${record.key}`}
            />
            <label htmlFor={`absent-checkbox-${record.key}`}>
              {!!record.absent ? (
                <CloseCircleFilled
                  style={{
                    color: "oklch(71.2% 0.194 13.428)",
                    fontSize: 20,
                    verticalAlign: "middle",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    width: 20,
                    height: 20,
                    border: "2px solid oklch(57.7% 0.245 27.325)",
                    borderRadius: "50%",
                    verticalAlign: "middle",
                    cursor: "pointer",
                  }}
                />
              )}
            </label>
          </span>
        ),
      },
      {
        title: t("table.session"),
        dataIndex: "session",
        key: "session",
        align: "center",
        width: 50,
      },
      {
        title: t("table.date"),
        dataIndex: "date",
        key: "date",
        align: "center",
        width: 80,
      },
      {
        title: t("table.weekday"),
        dataIndex: "weekday",
        key: "weekday",
        align: "center",
        width: 70,
      },
      {
        title: t("table.start"),
        dataIndex: "startTime",
        key: "startTime",
        align: "center",
        width: 60,
      },
      {
        title: t("table.end"),
        dataIndex: "endTime",
        key: "endTime",
        align: "center",
        width: 60,
      },
    ];
    // فقط اگر موبایل نیست ستون price را اضافه کن
    if (!isMobile) {
      baseColumns.push({
        title: t("table.price"),
        dataIndex: "price",
        key: "price",
        align: "center",
        width: 90,
      });
    }
    baseColumns.push({
      title: t("table.deposit"),
      dataIndex: "deposit",
      key: "deposit",
      align: "center",
      width: 130,
    });
    return baseColumns;
    //eslint-disable-next-line
  }, [t, isMobile]);

  const rowSelection: TableProps<SessionRow>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      if (!student) return;
      data.forEach((row) => {
        const shouldBeAttended = selectedKeys.includes(row.key);
        if (row.attended !== shouldBeAttended) {
          if (shouldBeAttended && row.absent) {
            toggleAbsent(student.id, row.key);
          }
          toggleAttendance(student.id, row.key);
        }
      });
    },
    columnTitle: t("table.attendance"),
    columnWidth: 50,
  };

  function rowClassName(record: SessionRow) {
    if (record.absent) return "row-absent";
    return "text-white";
  }

  if (!student || !student.sessions) {
    return <div className="text-gray-500">No session data available.</div>;
  }

  return (
    <>
      {contextHolder}

      <ModalCustom
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title=""
        className="text-right "
      >
        <div className="px-8" style={{ direction: "rtl" }}>
          <p className="text-center w-full block text-2xl text-teal-600 font-bold">
            ارسال پیامک پرداخت
          </p>
          <p className="my-5">
            زمان پرداخت شهریه برای دانش‌آموز{" "}
            <span className="font-bold text-teal-700">{student?.name}</span> با
            شماره{" "}
            <span className="font-bold text-teal-700">{student?.phone}</span>{" "}
            فرا رسیده است.
            <br />
            اگر می‌خواهید پیامک پرداخت ارسال شود، متن زیر را ویرایش کنید یا همان
            متن دیفالت را ارسال کنید.
          </p>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              components: {
                Input: {
                  colorPrimary: "#00bba7",
                  algorithm: true,
                },
              },
            }}
          >
            <TextArea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="متن پیامک پرداخت"
              rows={4}
              dir="rtl"
              style={{
                textAlign: "right",
                direction: "rtl",
              }}
              className="text-lg"
            />
          </ConfigProvider>
          <div className="flex justify-between items-center gap-4 mt-5">
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
              <Button
                key="send"
                type="primary"
                loading={sendingSMS}
                onClick={handleSendSMS}
                className="w-full"
              >
                ارسال
              </Button>
              <Button
                key="cancel"
                onClick={() => setIsModalOpen(false)}
                className="w-full"
              >
                لغو
              </Button>
            </ConfigProvider>
          </div>
        </div>
      </ModalCustom>

      <div
        className="overflow-x-auto rounded-lg border border-gray-500"
        style={{ maxHeight: 300, overflowY: "auto" }}
      >
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Table: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
            },
          }}
        >
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            size="small"
            bordered
            scroll={{ y: 250 }}
            rowSelection={rowSelection}
            rowClassName={rowClassName}
          />
        </ConfigProvider>
      </div>
    </>
  );
}
