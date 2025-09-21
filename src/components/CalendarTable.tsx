import React, { useMemo } from "react";
import { Table, Tag, ConfigProvider, theme } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import { Student, useStudentStore } from "../store/studentStore";
import { useTranslation } from "react-i18next";

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
  student: Student;
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

export default function CalendarTable({ student }: CalendarTableProps) {
  const toggleAttendance = useStudentStore((s) => s.toggleAttendance);
  const toggleAbsent = useStudentStore((s) => s.toggleAbsent);
  const { t, i18n } = useTranslation();

  const data: SessionRow[] = (student?.sessions ?? []).map((session, idx) => ({
    key: session.id, // کلید یکتا
    session: idx + 1,
    date: new Date(session.date).toLocaleDateString(
      i18n.language === "fa" ? "fa-IR" : "en-US"
    ),
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
      idx + 1 > student.daysPerWeek * 4 ? (
        <Tag color="yellow">{t("table.tuitionRequired")}</Tag>
      ) : (
        <Tag color="green">{t("table.tuitionDone")}</Tag>
      ),
  }));

  const selectedRowKeys = useMemo(
    () => data.filter((row) => row.attended).map((row) => row.key),
    [data]
  );

  if (!student || !student.sessions) {
    return <div className="text-gray-500">No session data available.</div>;
  }

  const columns: ColumnsType<SessionRow> = [
    {
      title: t("table.absent") || "Absent",
      dataIndex: "absent",
      key: "absent",
      align: "center",
      width: 50,
      //eslint-disable-next-line
      render: (_: any, record: SessionRow) => (
        <span
          className="flex items-center justify-center"
          style={{ minHeight: 24 }}
        >
          <input
            type="checkbox"
            checked={!!record.absent}
            onChange={() => {
              if (!record.absent) {
                if (record.attended) toggleAttendance(student.id, record.key); // حالا key همان id است
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
    {
      title: t("table.price"),
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 90,
    },
    {
      title: t("table.deposit"),
      dataIndex: "deposit",
      key: "deposit",
      align: "center",
      width: 130,
    },
  ];

  /* const rowSelection: TableProps<SessionRow>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      data.forEach((row) => {
        const shouldBeAttended = selectedKeys.includes(row.key);
        if (row.attended !== shouldBeAttended) {
          // اگر present فعال شد، absent را بردار
          if (shouldBeAttended && row.absent) {
            toggleAbsent(student.id, row.key);
          }
          toggleAttendance(student.id, row.key);
        }
      });
    },
    columnTitle: t("table.attendance"),
    columnWidth: 50,
  }; */
  const rowSelection: TableProps<SessionRow>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
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

  return (
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
  );
}
