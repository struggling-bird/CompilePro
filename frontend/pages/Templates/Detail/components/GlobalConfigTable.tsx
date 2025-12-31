import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip,
  Modal,
  Image,
  Spin,
} from "antd";
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
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const handlePreview = async (fileId: string) => {
    setLoadingFile(true);
    setPreviewVisible(true);
    setPreviewContent(null);
    setPreviewFile(null);
    try {
      const file = await getFile(fileId);
      setPreviewFile(file);

      const ext = file.extension?.toLowerCase();
      const BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "";

      if (["png", "jpg", "jpeg", "gif"].includes(ext || "")) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${BASE}/apis/storage/preview/${file.id}?w=800`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          if (!res.ok) throw new Error("Failed to fetch image");

          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);

          setPreviewContent(
            <div className="flex justify-center">
              <Image
                src={objectUrl}
                alt={file.name}
                style={{ maxWidth: "100%" }}
              />
            </div>
          );
        } catch (err) {
          console.error("Preview failed", err);
          setPreviewContent(
            <div className="text-red-500">
              {t.settings?.previewNotAvailable || "Preview load failed"}
            </div>
          );
        }
      } else {
        setPreviewContent(
          <div className="text-center p-8">
            <p>{t.settings?.previewNotAvailable || "Preview not available"}</p>
            <Button
              type="primary"
              href={`${BASE}/apis/storage/download/${file.id}`}
              target="_blank"
            >
              {t.settings?.download || "Download"}
            </Button>
          </div>
        );
      }
    } catch (e) {
      console.error(e);
      setPreviewContent(
        <div className="text-red-500">Failed to load file info</div>
      );
    } finally {
      setLoadingFile(false);
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
      <Modal
        title={previewFile?.name || t.settings?.filePreview || "File Preview"}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            {t.settings?.close || "Close"}
          </Button>,
        ]}
        width={800}
      >
        {loadingFile ? (
          <div className="flex justify-center p-8">
            <Spin size="large" />
          </div>
        ) : (
          previewContent
        )}
      </Modal>
    </div>
  );
};

export default GlobalConfigTable;
