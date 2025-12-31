import React, { useMemo } from "react";
import { Table, Input, Typography, Button, Space } from "antd";
import {
  TemplateGlobalConfig,
  CompilationGlobalConfig,
} from "../../../../types";
import { useLanguage } from "../../../../contexts/LanguageContext";

const { Text } = Typography;

interface GlobalConfigValueTableProps {
  configs: TemplateGlobalConfig[];
  values: CompilationGlobalConfig[];
  onChange: (configId: string, value: string) => void;
}

const GlobalConfigValueTable: React.FC<GlobalConfigValueTableProps> = ({
  configs,
  values,
  onChange,
}) => {
  const { t } = useLanguage();

  const valueMap = useMemo(() => {
    return values.reduce((acc, cur) => {
      acc[cur.configId] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }, [values]);

  const columns = [
    {
      title: t.compilationDetail.configName || "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.compilationDetail.targetValue || "Target Value",
      key: "value",
      width: "30%",
      render: (_: any, record: TemplateGlobalConfig) => {
        const val = valueMap[record.id] ?? record.defaultValue;
        return (
          <Input
            value={val}
            onChange={(e) => onChange(record.id, e.target.value)}
            placeholder={record.defaultValue}
          />
        );
      },
    },
    {
      title: t.compilationDetail.desc || "Description",
      dataIndex: "description",
      key: "description",
      width: "35%",
    },
    {
      title: t.compilationList.action || "Action",
      key: "action",
      width: "15%",
      render: () => (
        <Button type="link" size="small">
          {t.compilationDetail.detail || "View Detail"}
        </Button>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={configs}
      pagination={false}
      size="small"
      bordered
    />
  );
};

export default GlobalConfigValueTable;
