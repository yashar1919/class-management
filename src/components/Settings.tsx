import React from "react";
import { Switch } from "antd";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const { i18n, t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div
        className="bg-neutral-900 rounded-xl shadow p-4 w-full max-w-2xl border border-neutral-800"
        style={{ boxShadow: "0px 0px 7px gray" }}
      >
        <h2 className="text-2xl font-bold text-teal-400 mb-5 sm:text-start text-center">
          {t("settings.languageTitle")}
        </h2>
        <div className="flex flex-col gap-4 items-center justify-center sm:flex-row sm:justify-between sm:items-center">
          <span className="text-gray-400 text-sm text-center sm:text-left">
            {t("settings.languageDesc")}
          </span>
          <Switch
            checked={i18n.language === "en"}
            onChange={(checked) => i18n.changeLanguage(checked ? "en" : "fa")}
            checkedChildren="English"
            unCheckedChildren="فارسی"
            style={{
              background:
                i18n.language === "en" ? "darkolivegreen" : "darkslateblue",
              borderColor:
                i18n.language === "en" ? "darkolivegreen" : "darkslateblue",
              color: "#fff",
              width: i18n.language === "en" ? 80 : 70,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
