import React, { useState, useEffect } from "react";
import {
  Drawer,
  Tabs,
  Button,
  Input,
  Tree,
  Space,
  Row,
  Col,
  message,
  Spin,
  Form,
  InputNumber,
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { VersionConfig } from "@/types";
import { listProjectFiles, getFileContent } from "@/services/metaprojects";
import FilePreview from "@/components/FilePreview";

const { DirectoryTree } = Tree;

interface ConfigEditorDrawerProps {
  visible: boolean;
  projectId: string;
  config?: VersionConfig;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
}

const ConfigEditorDrawer: React.FC<ConfigEditorDrawerProps> = ({
  visible,
  projectId,
  config,
  onClose,
  onSave,
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

  // Reset match count when regex or content changes - NOW handled by FilePreview
  // But we still reset it here to be safe if FilePreview unmounts?
  // Actually FilePreview will call onMatchCountChange immediately.

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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await onSave({
        ...values,
        type: activeTab,
      });
      setSaving(false);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  const renderTextTab = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 8,
      }}
    >
      <div style={{ padding: "8px 16px 0", borderBottom: "1px solid #f0f0f0" }}>
        {/* Hidden but required field for selected file */}
        <Form.Item name="fileOriginPath" rules={[{ required: true }]} hidden>
          <Input />
        </Form.Item>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="配置名称"
              rules={[{ required: true, message: "请输入配置名称" }]}
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="Config Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label="配置描述"
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="Description" />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              name="textOrigin"
              label="正则表达式"
              rules={[{ required: true, message: "请输入正则表达式" }]}
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="/pattern/flags" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="matchIndex"
              label="匹配项索引 (从0开始)"
              initialValue={0}
              style={{ marginBottom: 6 }}
            >
              <InputNumber
                min={0}
                max={matchCount > 0 ? matchCount - 1 : 0}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <div
        style={{
          padding: "6px 16px",
          background: "#333",
          color: "#fff",
          borderBottom: "1px solid #444",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <span>预览内容</span>
        {matchCount > 0 && (
          <span style={{ color: "#ffaa00" }}>匹配到 {matchCount} 处</span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          padding: 16,
          overflow: "auto",
          minHeight: 200,
        }}
      >
        <Spin spinning={loadingContent}>
          <FilePreview
            content={fileContent}
            fileName={selectedFile}
            regexPattern={activeTab === "TEXT" ? regexPattern : undefined}
            matchIndex={matchIndex}
            onMatchCountChange={setMatchCount}
          />
        </Spin>
      </div>
    </div>
  );

  const renderFileTab = () => {
    const ext = selectedFile?.split(".").pop()?.toLowerCase();

    const isImageExt = (e?: string) =>
      ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
        (e || "").toLowerCase()
      );

    return (
      <div style={{ padding: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="配置名称"
              rules={[{ required: true, message: "请输入配置名称" }]}
            >
              <Input placeholder="Config Name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="fileOriginPath"
              hidden
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="配置描述">
              <Input placeholder="Description" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          文件预览
        </div>
        <div
          style={{
            marginTop: 8,
            minHeight: 220,
            border: "1px dashed #d9d9d9",
            borderRadius: 4,
            padding: 12,
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selectedFile ? (
            isImageExt(ext) ? (
              imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt={selectedFile}
                  style={{ maxWidth: "100%", maxHeight: 360 }}
                />
              ) : (
                <div style={{ color: "#999" }}>图片预览不可用</div>
              )
            ) : (
              <div style={{ color: "#999" }}>仅支持图片类型预览</div>
            )
          ) : (
            <div style={{ color: "#999" }}>请从左侧选择文件</div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "TEXT":
        return renderTextTab();
      case "FILE":
        return renderFileTab();
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
