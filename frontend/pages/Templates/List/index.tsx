import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Tag, Switch, Space, message, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_TEMPLATES } from "../../../constants";
import type { ProjectTemplate } from "../../../types";
import styles from "../styles/List.module.less";

const { Text } = Typography;

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState<ProjectTemplate[]>(MOCK_TEMPLATES);

  const handleToggleStatus = (id: string, checked: boolean) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEnabled: checked } : item
      )
    );
    message.success(checked ? "Template Enabled" : "Template Disabled");
  };

  const filteredData = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(k)
    );
  }, [data, keyword]);

  const columns = [
    {
      title: t.templateList.name || "Template Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: ProjectTemplate, b: ProjectTemplate) => a.name.localeCompare(b.name),
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.templateList.latestVersion || "Latest Version",
      dataIndex: "latestVersion",
      key: "latestVersion",
      render: (text: string) => <Tag color="blue" className={styles.versionTag}>v{text}</Tag>,
    },
    {
      title: "Update Time",
      dataIndex: "updateTime",
      key: "updateTime",
      width: 160,
    },
    {
      title: "Updater",
      dataIndex: "updater",
      key: "updater",
      width: 120,
    },
    {
      title: t.templateList.author || "Creator",
      dataIndex: "author",
      key: "author",
      width: 120,
    },
    {
      title: t.templateList.createdDate || "Create Time",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 160,
    },
    {
      title: t.templateList.action || "Action",
      key: "action",
      width: 180,
      render: (_: any, record: ProjectTemplate) => (
        <Space>
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => navigate(`/templates/${record.id}`)}
          >
            {t.templateList.edit || "Edit"}
          </Button>
          <Switch
            checkedChildren="ON"
            unCheckedChildren="OFF"
            checked={record.isEnabled}
            onChange={(checked) => handleToggleStatus(record.id, checked)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.left}>
          <Input
            placeholder={t.templateList.searchPlaceholder || "Search templates..."}
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.search}
            allowClear
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/templates/new")}
        >
          {t.templateList.newTemplate || "New Template"}
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10, showTotal: (total) => `Total ${total} items` }}
      />
    </div>
  );
};

export default TemplateListPage;
