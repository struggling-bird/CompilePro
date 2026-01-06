import React, { useState, useEffect } from "react";
import { Modal, Image, Button, Empty, Spin } from "antd";
import { DownloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import { FileItem } from "../../services/storageAnalysis";
import { useLanguage } from "../../contexts/LanguageContext";

interface FilePreviewModalProps {
  visible: boolean;
  file: FileItem | null;
  onCancel: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  visible,
  file,
  onCancel,
}) => {
  const { t } = useLanguage();
  const [content, setContent] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && file) {
      loadContent(file);
    } else {
      setContent(null);
    }
  }, [visible, file]);

  const loadContent = async (file: FileItem) => {
    setLoading(true);
    const ext = file.extension?.toLowerCase();
    const BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "";

    try {
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

          setContent(
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
          setContent(
            <div className="h-[300px] flex items-center justify-center text-red-500">
              {t.settings?.previewNotAvailable || "Preview load failed"}
            </div>
          );
        }
      } else if (["txt", "js", "json", "css", "md"].includes(ext || "")) {
        // TODO: Implement actual text fetching
        setContent(
          <div className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-[500px] font-mono text-sm">
            <pre>{`// This is a mock preview for ${file.name}\n\nfunction demo() {\n  console.log("Hello World");\n  return true;\n}\n\n// End of file`}</pre>
          </div>
        );
      } else if (ext === "pdf") {
        setContent(
          <div className="h-[500px] flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded">
            <div className="text-center">
              <FilePdfOutlined style={{ fontSize: 48, color: "#ff4d4f" }} />
              <p className="mt-4 text-gray-500">PDF Preview Placeholder</p>
              <Button
                type="primary"
                className="mt-2"
                onClick={() =>
                  window.open(`${BASE}/apis/storage/download/${file.id}`)
                }
              >
                {t.settings?.download || "Download"}
              </Button>
            </div>
          </div>
        );
      } else {
        setContent(
          <div className="h-[300px] flex items-center justify-center">
            <Empty
              description={
                t.settings?.previewNotAvailable || "Preview not available"
              }
            />
          </div>
        );
      }
    } catch (e) {
      console.error(e);
      setContent(<div className="text-red-500">Failed to load file info</div>);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={file?.name || t.settings?.filePreview || "File Preview"}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          {t.settings?.close || "Close"}
        </Button>,
        file && (
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              const BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "";
              window.open(`${BASE}/apis/storage/download/${file.id}`);
            }}
          >
            {t.settings?.download || "Download"}
          </Button>
        ),
      ]}
    >
      {loading ? (
        <div className="flex justify-center p-8">
          <Spin size="large" />
        </div>
      ) : (
        content
      )}
    </Modal>
  );
};

export default FilePreviewModal;
