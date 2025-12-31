import React, { useState } from "react";
import { Table, Button, Space, Tag, Typography, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { TemplateGlobalConfig } from "../../../../types";
import styles from "../../styles/Detail.module.less";
import { getFile, FileItem } from "../../../../services/storageAnalysis";
import FilePreviewModal from "../../../../components/FilePreview/FilePreviewModal";

import { useLanguage } from "../../../../contexts/LanguageContext";

const { Text, Title } = Typography;

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const handlePreview = async (fileId: string) => {
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
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.templateDetail.defaultValue,
      dataIndex: "defaultValue",
      key: "defaultValue",
      render: (text: string, record: TemplateGlobalConfig) =>
        record.type === "FILE" ? (
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
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {t.templateDetail.addGlobalConfig}
          </Button>
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
        dataSource={configs}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        size="small"
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
