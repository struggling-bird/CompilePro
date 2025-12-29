import React from "react";
import { Table, Button, Switch, Space, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { TemplateGlobalConfig } from "../../../../types";

import { useLanguage } from "../../../../contexts/LanguageContext";

const { Text } = Typography;

interface GlobalConfigTableProps {
  configs: TemplateGlobalConfig[];
  onEdit: (config: TemplateGlobalConfig) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  usageCounts: Record<string, number>;
}

const GlobalConfigTable: React.FC<GlobalConfigTableProps> = ({
  configs,
  onEdit,
  onDelete,
  onAdd,
  usageCounts,
}) => {
  const { t } = useLanguage();

  const columns = [
    {
      title: t.templateDetail.name,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.templateDetail.defaultValue,
      dataIndex: "defaultValue",
      key: "defaultValue",
      render: (text: string, record: TemplateGlobalConfig) =>
        record.type === "FILE" ? (
          <Tag color="blue">File</Tag>
        ) : (
          <Text copyable>{text}</Text>
        ),
    },
    {
      title: t.templateDetail.desc,
      dataIndex: "description",
      key: "description",
    },
    {
      title: t.templateDetail.usedBy,
      key: "usage",
      render: (_: any, record: TemplateGlobalConfig) => (
        <Tag color="geekblue">{usageCounts[record.id] || 0} Modules</Tag>
      ),
    },
    {
      title: t.templateDetail.isHidden,
      dataIndex: "isHidden",
      key: "isHidden",
      render: (val: boolean) =>
        val ? t.templateDetail.yes : t.templateDetail.no,
    },
    {
      title: t.templateDetail.action,
      key: "action",
      render: (_: any, record: TemplateGlobalConfig) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
            disabled={(usageCounts[record.id] || 0) > 0}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          {t.templateDetail.addGlobalConfig}
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={configs}
        pagination={false}
        size="small"
        locale={{ emptyText: t.templateDetail.noData }}
      />
    </div>
  );
};

export default GlobalConfigTable;
