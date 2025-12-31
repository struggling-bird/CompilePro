import React, { useState, useEffect } from "react";
import {
  Drawer,
  Tabs,
  Button,
  Input,
  Tree,
  Space,
  message,
  Spin,
  Form,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { VersionConfig } from "@/types";
import { listProjectFiles, getFileContent } from "@/services/metaprojects";
import TextReplacePanel from "./TextReplacePanel";
import FileReplacePanel from "./FileReplacePanel";

const { DirectoryTree } = Tree;

interface ConfigEditorDrawerProps {
  visible: boolean;
  projectId: string;
  config?: VersionConfig;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
  enableTargetEdit?: boolean;
}

const ConfigEditorDrawer: React.FC<ConfigEditorDrawerProps> = ({
  visible,
  projectId,
  config,
  onClose,
  onSave,
  enableTargetEdit,
}) => {
  const [activeTab, setActiveTab] = useState("TEXT");
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const regexPattern = Form.useWatch("textOrigin", form);
  const [matchCount, setMatchCount] = useState(0);
  const matchIndex = Form.useWatch("matchIndex", form) || 0;
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [uploadedTargetFile, setUploadedTargetFile] = useState<File | null>(
    null
  );
  const [targetImagePreviewUrl, setTargetImagePreviewUrl] =
    useState<string>("");

  // Default to false if enableTargetEdit is undefined
  const isTargetEditEnabled = !!enableTargetEdit;

  useEffect(() => {
    if (visible) {
      if (config) {
        setActiveTab(config.type);
        form.setFieldsValue({
          ...config,
          matchIndex: config.matchIndex || 0,
        });
        if (config.fileOriginPath) {
          setSelectedFile(config.fileOriginPath);
          if (config.type === "TEXT" || config.type === "FILE") {
            loadFileContent(config.fileOriginPath);
          }
        }
      } else {
        setActiveTab("TEXT");
        form.resetFields();
        form.setFieldValue("matchIndex", 0);
        setSelectedFile("");
        setFileContent("");
      }
      fetchFiles();
    }
  }, [visible, config, projectId]);

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const data = await listProjectFiles(projectId);
      setTreeData(data);
    } catch (err: any) {
      message.error("无法加载文件列表: " + err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  const loadFileContent = async (path: string) => {
    try {
      setLoadingContent(true);
      const content = await getFileContent(projectId, path);
      setFileContent(content);
    } catch (err: any) {
      // If file doesn't exist or is binary, might fail.
      // For now just show empty or error
      setFileContent("(无法读取文件内容)");
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSelect = (_: any, info: any) => {
    if (info.node.isLeaf) {
      const path = info.node.key;
      setSelectedFile(path);
      form.setFieldValue("fileOriginPath", path);
      if (activeTab === "TEXT" || activeTab === "FILE") {
        loadFileContent(path);
      }
    }
  };

  useEffect(() => {
    const ext = selectedFile?.split(".").pop()?.toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "");
    if (activeTab === "FILE" && selectedFile && isImage) {
      const BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "";
      const token =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("token")
          : null;
      const url = `${BASE}/apis/metaprojects/${projectId}/files/preview?path=${encodeURIComponent(
        selectedFile
      )}`;
      (async () => {
        try {
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          setImagePreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return objUrl;
          });
        } catch (e) {
          setImagePreviewUrl("");
        }
      })();
    } else {
      setImagePreviewUrl("");
    }
    // Cleanup on unmount
    return () => {
      setImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
    };
  }, [activeTab, selectedFile, projectId]);

  useEffect(() => {
    const ext = uploadedTargetFile?.name.split(".").pop()?.toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
      ext || ""
    );
    if (activeTab === "FILE" && uploadedTargetFile && isImage) {
      const objUrl = URL.createObjectURL(uploadedTargetFile);
      setTargetImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objUrl;
      });
    } else {
      setTargetImagePreviewUrl("");
    }
    return () => {
      setTargetImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
    };
  }, [activeTab, uploadedTargetFile]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { textTarget, ...rest } = values;
      setSaving(true);

      const payload: any = {
        ...rest,
        type: activeTab,
      };

      if (isTargetEditEnabled) {
        if (activeTab === "TEXT") {
          payload.textTarget = textTarget;
        } else if (activeTab === "FILE") {
          payload.uploadedTargetFile = uploadedTargetFile;
        }
      }

      await onSave(payload);
      setSaving(false);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "TEXT":
        return (
          <TextReplacePanel
            form={form}
            fileContent={fileContent}
            selectedFile={selectedFile}
            loadingContent={loadingContent}
            matchCount={matchCount}
            matchIndex={matchIndex}
            regexPattern={regexPattern}
            isTargetEditEnabled={isTargetEditEnabled}
            onMatchCountChange={setMatchCount}
          />
        );
      case "FILE":
        return (
          <FileReplacePanel
            selectedFile={selectedFile}
            isTargetEditEnabled={isTargetEditEnabled}
            uploadedTargetFile={uploadedTargetFile}
            targetImagePreviewUrl={targetImagePreviewUrl}
            imagePreviewUrl={imagePreviewUrl}
            onUploadedTargetFileChange={setUploadedTargetFile}
            onTargetImagePreviewUrlChange={setTargetImagePreviewUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      title={
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ marginBottom: 0 }}
          items={[
            { key: "TEXT", label: "文本替换" },
            { key: "FILE", label: "文件替换" },
          ]}
        />
      }
      placement="right"
      size={1300}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
          >
            保存
          </Button>
        </Space>
      }
      styles={{
        header: {
          paddingTop: 8,
          paddingBottom: 8,
        },
        body: { padding: 0, display: "flex", overflow: "hidden" },
      }}
    >
      <div
        style={{
          width: 450,
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f0f0f0",
            fontWeight: 500,
          }}
        >
          文件列表
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 8 }}>
          <Spin spinning={loadingFiles}>
            {treeData.length > 0 ? (
              <DirectoryTree onSelect={handleSelect} treeData={treeData} />
            ) : (
              <div style={{ padding: 16, textAlign: "center", color: "#999" }}>
                暂无文件或未加载
              </div>
            )}
          </Spin>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Form form={form} layout="vertical" style={{ height: "100%" }}>
          {renderContent()}
        </Form>
      </div>
    </Drawer>
  );
};

export default ConfigEditorDrawer;
