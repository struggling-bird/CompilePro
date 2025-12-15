import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_TEMPLATES } from "../../../constants";
import type { ProjectTemplate } from "../../../types";

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const [data] = useState<ProjectTemplate[]>(MOCK_TEMPLATES);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return data;
    return data.filter((tpl) =>
      [tpl.name, tpl.description, tpl.author].some((f) =>
        (f || "").toLowerCase().includes(k)
      )
    );
  }, [data, keyword]);

  const columns = [
    { title: t.templateList.name, dataIndex: "name", key: "name" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (v: string) => (
        <Tag
          color={
            v === "Frontend" ? "blue" : v === "Backend" ? "green" : "default"
          }
        >
          {v}
        </Tag>
      ),
    },
    { title: t.templateList.author, dataIndex: "author", key: "author" },
    {
      title: t.templateList.createdDate,
      dataIndex: "createdDate",
      key: "createdDate",
    },
    {
      title: t.templateList.action,
      key: "action",
      render: (_: any, record: ProjectTemplate) => (
        <Button type="link" onClick={() => navigate(`/templates/${record.id}`)}>
          {t.templateList.edit}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder={t.templateList.searchPlaceholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/templates/new")}
        >
          {t.templateList.newTemplate}
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default TemplateListPage;
