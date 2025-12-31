import React, { useEffect, useState } from "react";
import {
  Table,
  Breadcrumb,
  Button,
  Space,
  Card,
  Popconfirm,
  message,
} from "antd";
import FilePreviewModal from "../../../../components/FilePreview/FilePreviewModal";
import dayjs from "dayjs";
import {
  FolderOutlined,
  FileOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  EyeOutlined,
  DownloadOutlined,
  HomeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  listFiles,
  deleteFile,
  FileItem,
} from "../../../../services/storageAnalysis";
import { useLanguage } from "../../../../contexts/LanguageContext";

const FileExplorer: React.FC = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined
  );
  const [breadcrumbs, setBreadcrumbs] = useState<
    Array<{ id?: string; name: string }>
  >([{ name: "Home" }]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const fetchFiles = async (parentId?: string) => {
    setLoading(true);
    try {
      const data = await listFiles(parentId);
      setFiles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentFolderId);
  }, [currentFolderId]);

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
    setPreviewVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFile(id);
      message.success(t.common?.success || "Deleted successfully");
      fetchFiles(currentFolderId);
    } catch (error) {
      console.error(error);
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder")
      return <FolderOutlined style={{ color: "#1890ff", fontSize: 20 }} />;
    const ext = file.extension?.toLowerCase();
    if (["png", "jpg", "jpeg", "gif"].includes(ext || ""))
      return <FileImageOutlined style={{ color: "#52c41a", fontSize: 20 }} />;
    if (ext === "pdf")
      return <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />;
    if (["doc", "docx"].includes(ext || ""))
      return <FileWordOutlined style={{ color: "#1890ff", fontSize: 20 }} />;
    if (["txt", "md", "js", "json"].includes(ext || ""))
      return <FileTextOutlined style={{ color: "#faad14", fontSize: 20 }} />;
    return <FileOutlined style={{ fontSize: 20 }} />;
  };

  const columns = [
    {
      title: t.settings.fileName,
      key: "name",
      render: (_: any, record: FileItem) => (
        <Space>
          {getFileIcon(record)}
          <a
            onClick={() =>
              record.type === "folder"
                ? (setBreadcrumbs([
                    ...breadcrumbs,
                    { id: record.id, name: record.name },
                  ]),
                  setCurrentFolderId(record.id))
                : handlePreview(record)
            }
            className="text-gray-800 hover:text-blue-600"
          >
            {record.name}
          </a>
        </Space>
      ),
    },
    {
      title: t.settings.fileSize,
      dataIndex: "size",
      key: "size",
      width: 120,
      render: (val: number) => (val ? `${(val / 1024).toFixed(1)} KB` : "-"),
    },
    {
      title: t.settings.modifiedTime,
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      className: "text-gray-500",
      render: (val: string) =>
        val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: t.settings.action,
      key: "action",
      width: 150,
      render: (_: any, record: FileItem) =>
        record.type === "file" && (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handlePreview(record)}
            />
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => {
                const BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "";
                window.open(`${BASE}/apis/storage/download/${record.id}`);
              }}
            />
            <Popconfirm
              title={t.settings.deleteConfirm}
              onConfirm={() => handleDelete(record.id)}
              okText={t.settings.yes}
              cancelText={t.settings.no}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Breadcrumb
          items={[
            {
              title: (
                <HomeOutlined
                  onClick={() => {
                    setBreadcrumbs([{ name: "Home" }]);
                    setCurrentFolderId(undefined);
                  }}
                  className="cursor-pointer"
                />
              ),
            },
            ...breadcrumbs.slice(1).map((b, idx) => ({
              title: (
                <a
                  onClick={() => {
                    const next = breadcrumbs.slice(0, idx + 2);
                    setBreadcrumbs(next);
                    setCurrentFolderId(next[next.length - 1].id);
                  }}
                >
                  {b.name}
                </a>
              ),
            })),
          ]}
        />
      </div>

      <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={files}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>

      <FilePreviewModal
        visible={previewVisible}
        file={previewFile}
        onCancel={() => setPreviewVisible(false)}
      />
    </div>
  );
};

export default FileExplorer;
