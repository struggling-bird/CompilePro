import React from "react";
import { Table, Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { VersionConfig } from "@/types";

interface ConfigTableProps {
  loading: boolean;
  dataSource: VersionConfig[];
  onEdit: (record: VersionConfig) => void;
  onDelete: (record: VersionConfig) => void;
}

const ConfigTable: React.FC<ConfigTableProps> = ({
  loading,
  dataSource,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (text: string) => {
        const map = {
          TEXT: "文本替换",
          FILE: "文件替换",
        };
        return map[text as keyof typeof map] || text;
      },
    },
    {
      title: "文件位置",
      dataIndex: "fileOriginPath",
      key: "fileOriginPath",
      width: 200,
    },
    {
      title: "正则表达式",
      key: "pattern",
      width: 200,
      render: (_: any, record: VersionConfig) => {
        if (record.type === "TEXT") {
          return record.textOrigin;
        }
        return "-";
      },
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_: any, record: VersionConfig) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此配置吗？"
            onConfirm={() => onDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      size="small"
      pagination={false}
    />
  );
};

export default ConfigTable;
