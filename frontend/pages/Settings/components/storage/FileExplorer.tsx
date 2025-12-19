import React, { useEffect, useState } from "react";
import {
  Table,
  Breadcrumb,
  Button,
  Modal,
  Image,
  Tag,
  Space,
  Card,
  Empty,
} from "antd";
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
} from "@ant-design/icons";
import { listFiles, FileItem } from "../../../../services/storageAnalysis";
import { useLanguage } from "../../../../contexts/LanguageContext";

const FileExplorer: React.FC = () => {
  const { t } = useLanguage();
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<React.ReactNode>(null);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const data = await listFiles(path);
      setFiles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
    const ext = file.extension?.toLowerCase();

    if (["png", "jpg", "jpeg", "gif"].includes(ext || "")) {
      setPreviewContent(
        <div className="flex justify-center">
          <Image
            src={`https://via.placeholder.com/600x400?text=${file.name}`}
            alt={file.name}
            style={{ maxWidth: "100%" }}
          />
        </div>
      );
    } else if (["txt", "js", "json", "css", "md"].includes(ext || "")) {
      setPreviewContent(
        <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-[500px] font-mono text-sm">
          <pre>{`// This is a mock preview for ${file.name}\n\nfunction demo() {\n  console.log("Hello World");\n  return true;\n}\n\n// End of file`}</pre>
        </div>
      );
    } else if (ext === "pdf") {
      setPreviewContent(
        <div className="h-[500px] flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded">
          <div className="text-center">
            <FilePdfOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />
            <p className="mt-4 text-gray-500">PDF Preview Placeholder</p>
            <Button type="primary" className="mt-2">
              Download to view
            </Button>
          </div>
        </div>
      );
    } else {
      setPreviewContent(
        <div className="h-[300px] flex items-center justify-center">
          <Empty description="Preview not available for this file type" />
        </div>
      );
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
                ? setCurrentPath(`${currentPath}${record.name}/`)
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
      width: 150,
      className: "text-gray-500",
    },
    {
      title: t.settings.action,
      key: "action",
      width: 100,
      render: (_: any, record: FileItem) =>
        record.type === "file" && (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handlePreview(record)}
            />
            <Button type="text" icon={<DownloadOutlined />} size="small" />
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
                  onClick={() => setCurrentPath("/")}
                  className="cursor-pointer"
                />
              ),
            },
            ...currentPath
              .split("/")
              .filter(Boolean)
              .map((p) => ({ title: p })),
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

      <Modal
        title={previewFile?.name}
        open={!!previewFile}
        onCancel={() => setPreviewFile(null)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewFile(null)}>
            Close
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            Download
          </Button>,
        ]}
      >
        {previewContent}
      </Modal>
    </div>
  );
};

export default FileExplorer;
