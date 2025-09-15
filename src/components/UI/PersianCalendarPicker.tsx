import React from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/colors/teal.css";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import "react-multi-date-picker/styles/layouts/mobile.css";
import { DateObject } from "react-multi-date-picker";
import { CalendarOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface PersianCalendarPickerProps {
  value: DateObject | DateObject[] | null;
  onChange: (value: DateObject[]) => void;
  multiple?: boolean;
  error?: string | boolean;
}

const PersianCalendarPicker: React.FC<PersianCalendarPickerProps> = ({
  value,
  onChange,
  multiple = false,
  error,
}) => {
  React.useEffect(() => {
    //console.log("PersianCalendarPicker error prop:", error);
  }, [error]);

  const { t } = useTranslation();
  const handleChange = (val: DateObject | DateObject[] | null) => {
    // همیشه آرایه برگردونیم، حتی اگه multiple=false باشه
    if (val === null) {
      onChange([]);
    } else if (Array.isArray(val)) {
      // اگر multiple=true باشه، بدون محدودیت
      onChange(val);
    } else {
      // اگه یک DateObject تکی آمد، به آرایه تبدیلش کن
      onChange([val]);
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
        <CalendarOutlined
          style={{
            color: error ? "#ef4444" : "#9ca3af",
            fontSize: "16px",
          }}
        />
      </div>
      <DatePicker
        value={
          multiple
            ? value // اگر multiple است، آرایه بده
            : Array.isArray(value)
            ? value[0] || null // اگر آرایه است، فقط اولین مقدار را بده
            : value // اگر مقدار تکی است، همان را بده
        }
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        multiple={multiple}
        format="YYYY/MM/DD"
        className={`teal bg-dark rmdp-mobile w-full ${
          error ? "border-red-500" : ""
        }`}
        style={{
          borderRadius: "10px",
          width: "100%",
          border: error ? "1px solid #ef4444" : "1px solid #404040",
          padding: "19px 19px 19px 45px", // اضافه کردن padding-left برای آیکون
          fontSize: "12px",
          color: error ? "red" : undefined,
        }}
        placeholder={t("studentForm.chooseClassDate")}
      />
    </div>
  );
};

export default PersianCalendarPicker;
