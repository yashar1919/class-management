import React from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/colors/teal.css";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import "react-multi-date-picker/styles/layouts/mobile.css";

interface PersianCalendarPickerProps {
  value: any;
  onChange: (value: any) => void;
  multiple?: boolean;
  error?: string | boolean;
  max?: number;
}

const PersianCalendarPicker: React.FC<PersianCalendarPickerProps> = ({
  value,
  onChange,
  multiple = false,
  error,
  max,
}) => {
  React.useEffect(() => {
    console.log("PersianCalendarPicker error prop:", error);
  }, [error]);

  const handleChange = (val: any) => {
    if (multiple && Array.isArray(val) && max && val.length > max) {
      // اگه بیشتر از حد مجاز شد، فقط اولین n تا رو نگه داریم
      const limited = val.slice(-max);
      onChange(limited);
    } else {
      onChange(val);
    }
  };

  return (
    <div>
      {/* <DatePicker
  value={multiple ? value : Array.isArray(value) ? value[0] || null : value}
  onChange={handleChange}
  calendar={persian}
  locale={persian_fa}
  multiple={multiple}
  format="YYYY/MM/DD"
  mapDays={({ date }) => {
    if (multiple && Array.isArray(value) && max && value.length >= max) {
      // وقتی max پر شد → همه روزهای دیگه disable بشن
      const isSelected = value.some((d: any) => d?.toString() === date.toString());
      return {
        disabled: !isSelected,
        style: !isSelected ? { color: "#999", cursor: "not-allowed" } : {}
      };
    }
  }}
/> */}

      <DatePicker
        value={
          multiple ? value : Array.isArray(value) ? value[0] || null : value
        }
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        multiple={multiple}
        format="YYYY/MM/DD"
        className={`teal bg-dark  w-full ${
          error ? "border-red-500" : ""
        }`} //rmdp-mobile
        style={{
          borderRadius: "10px",
          width: "100%",
          border: error ? "1px solid #ef4444" : "1px solid #404040",
          padding: "19px",
          fontSize: "12px",
          color: error ? "#DF252B" : undefined,
        }}
        placeholder="Choose class date"
        mapDays={({ date }) => {
          if (multiple && Array.isArray(value) && max && value.length >= max) {
            // وقتی max پر شد → همه روزهای دیگه disable بشن
            const isSelected = value.some(
              (d: any) => d?.toString() === date.toString()
            );
            return {
              disabled: !isSelected,
              style: !isSelected
                ? { color: "#999", cursor: "not-allowed" }
                : {},
            };
          }
        }} // mapDays در موبایل ساپورت نمیشود
      />
      {/* <DatePicker
        value={
          multiple
            ? value // اگر multiple است، آرایه بده
            : Array.isArray(value)
            ? value[0] || null // اگر آرایه است، فقط اولین مقدار را بده
            : value // اگر مقدار تکی است، همان را بده
        }
        onChange={onChange}
        calendar={persian}
        locale={persian_fa}
        multiple={multiple}
         {...(multiple ? { max: 3 } : {})} 
        format="YYYY/MM/DD"
        className={`teal bg-dark rmdp-mobile w-full ${
          error ? "border-red-500" : ""
        }`}
        style={{
          borderRadius: "10px",
          width: "100%",
          border: error ? "1px solid #ef4444" : "1px solid #404040",
          padding: "19px",
          fontSize: "12px",
          color: error ? "#DF252B" : undefined,
        }}
        placeholder="Choose class date"
      /> */}
    </div>
  );
};

export default PersianCalendarPicker;
