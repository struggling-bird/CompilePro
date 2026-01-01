import React, { useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip,
  Input,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { TemplateGlobalConfig, CompilationGlobalConfig } from "../../types";
import styles from "./index.module.less";
import { getFile, FileItem } from "../../services/storageAnalysis";
import FilePreviewModal from "../FilePreview/FilePreviewModal";

import { useLanguage } from "../../contexts/LanguageContext";

const { Text, Title } = Typography;

interface GlobalConfigTableProps {
  configs: TemplateGlobalConfig[];
  // Mode: SCHEMA (default) for Template Edit, INSTANCE for Compilation Edit
  mode?: "SCHEMA" | "INSTANCE";
  // Schema Mode Props
  onEdit?: (config: TemplateGlobalConfig) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  usageCounts?: Record<string, number>;
  // Instance Mode Props
  values?: CompilationGlobalConfig[];
  onValueChange?: (configId: string, value: string) => void;
}

const GlobalConfigTable: React.FC<GlobalConfigTableProps> = ({
  configs,
  mode = "SCHEMA",
  onEdit,
  onDelete,
  onAdd,
  usageCounts = {},
  values = [],
  onValueChange,
}) => {
  const { t } = useLanguage();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Instance mode: Manually added hidden configs
  const [shownHiddenConfigs, setShownHiddenConfigs] = useState<string[]>([]);

  const valueMap = useMemo(() => {
    return values.reduce((acc, cur) => {
      acc[cur.configId] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }, [values]);

  const handlePreview = async (fileId: string) => {
    if (!fileId) return;
    try {
      const file = await getFile(fileId);
      setPreviewFile(file);
      setPreviewVisible(true);
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    {
      title: t.templateDetail.name,
      dataIndex: "name",
      key: "name",
      width: mode === "INSTANCE" ? "20%" : undefined,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title:
        mode === "INSTANCE"
          ? t.compilationDetail?.targetValue || "Target Value"
          : t.templateDetail.defaultValue,
      dataIndex: "defaultValue",
      key: "defaultValue",
      render: (text: string, record: TemplateGlobalConfig) => {
        // Schema Mode: Show Value & Preview if File
        return record.type === "FILE" ? (
          <Space>
            <Tag color="blue">File</Tag>
            <Tooltip title={t.settings?.preview || "Preview"}>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(text)}
              />
            </Tooltip>
          </Space>
        ) : (
          <Text copyable>{text}</Text>
        );
      },
    },
    {
      title: t.templateDetail.desc,
      dataIndex: "description",
      key: "description",
      width: mode === "INSTANCE" ? "35%" : undefined,
    },
    {
      title: t.templateDetail.usedBy,
      key: "usage",
      width: mode === "INSTANCE" ? 100 : undefined, // Fixed width for alignment
      render: (_: any, record: TemplateGlobalConfig) => (
        <Tag color="geekblue">{usageCounts[record.id] || 0} Modules</Tag>
      ),
    },
    ...(mode === "SCHEMA"
      ? [
          {
            title: t.templateDetail.isHidden,
            dataIndex: "isHidden",
            key: "isHidden",
            render: (val: boolean) =>
              val ? t.templateDetail.yes : t.templateDetail.no,
          },
        ]
      : []),
    {
      title: t.templateDetail.createdAt,
      dataIndex: "createdAt",
      key: "createdAt",
      width: mode === "INSTANCE" ? 180 : undefined,
      render: (text: string) => (
        <Text>{text ? new Date(text).toLocaleString() : "-"}</Text>
      ),
    },
    {
      title: t.templateDetail.action,
      key: "action",
      width: mode === "INSTANCE" ? "10%" : undefined,
      render: (_: any, record: TemplateGlobalConfig) => {
        return (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(record)}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(record.id)}
              disabled={(usageCounts[record.id] || 0) > 0}
            />
          </Space>
        );
      },
    },
  ];

  // Filter Data
  const dataSource = useMemo(() => {
    if (mode === "SCHEMA") return configs;

    // Instance Mode: Show visible configs OR manually added hidden configs OR configs that have values
    return configs.filter(
      (c) =>
        !c.isHidden ||
        shownHiddenConfigs.includes(c.id) ||
        (valueMap && valueMap[c.id] !== undefined)
    );
  }, [configs, mode, shownHiddenConfigs, valueMap]);

  // Hidden configs available to add
  const hiddenOptions = useMemo(() => {
    if (mode !== "INSTANCE") return [];
    return configs.filter(
      (c) =>
        c.isHidden &&
        !shownHiddenConfigs.includes(c.id) &&
        (!valueMap || valueMap[c.id] === undefined)
    );
  }, [configs, mode, shownHiddenConfigs, valueMap]);

  const handleAddHiddenConfig = (configId: string) => {
    setShownHiddenConfigs((prev) => [...prev, configId]);
  };

  return (
    <div className={isFullScreen ? styles.fullScreen : ""}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          {t.templateDetail.globalConfigTitle}
        </Title>
        <Space>
          {mode === "SCHEMA" && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              {t.templateDetail.addGlobalConfig}
            </Button>
          )}
          {mode === "INSTANCE" && hiddenOptions.length > 0 && (
            <Select
              placeholder={t.compilationDetail.addConfig || "Add Config"}
              style={{ width: 250 }}
              showSearch
              value={null}
              onChange={handleAddHiddenConfig}
              filterOption={(input, option) => {
                const config = hiddenOptions.find((c) => c.id === option?.key);
                if (!config) return false;
                const searchStr =
                  `${config.name} ${config.description} ${config.defaultValue}`.toLowerCase();
                return searchStr.includes(input.toLowerCase());
              }}
            >
              {hiddenOptions.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{c.name}</span>
                    <span
                      style={{
                        color: "#999",
                        fontSize: "12px",
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.description}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          )}
          <Tooltip title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}>
            <Button
              icon={
                isFullScreen ? (
                  <FullscreenExitOutlined />
                ) : (
                  <FullscreenOutlined />
                )
              }
              onClick={() => setIsFullScreen(!isFullScreen)}
            />
          </Tooltip>
        </Space>
      </div>
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={dataSource}
        pagination={false}
        locale={{ emptyText: t.templateDetail.noData }}
      />
      <FilePreviewModal
        visible={previewVisible}
        file={previewFile}
        onCancel={() => setPreviewVisible(false)}
      />
    </div>
  );
};

export default GlobalConfigTable;
