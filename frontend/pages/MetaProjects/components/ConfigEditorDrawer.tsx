import React, { useState, useEffect } from "react";
import {
  Drawer,
  Tabs,
  Button,
  Input,
  Checkbox,
  Tree,
  Space,
  Row,
  Col,
  Upload,
  message,
  Spin,
  Form,
} from "antd";
import { SaveOutlined, InboxOutlined } from "@ant-design/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { VersionConfig } from "@/types";
import { listProjectFiles, getFileContent } from "@/services/metaprojects";

const { TextArea } = Input;
const { DirectoryTree } = Tree;
const { Dragger } = Upload;

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
  const { t } = useLanguage();
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

  useEffect(() => {
    if (visible) {
      if (config) {
        setActiveTab(config.type);
        form.setFieldsValue(config);
        if (config.fileOriginPath) {
          setSelectedFile(config.fileOriginPath);
          // If it's TEXT mode, we should try to load the content if we can
          if (config.type === "TEXT") {
            loadFileContent(config.fileOriginPath);
          }
        }
      } else {
        setActiveTab("TEXT");
        form.resetFields();
        setSelectedFile("");
        setFileContent("");
      }
      fetchFiles();
    }
  }, [visible, config, projectId]);

  // Reset match count when regex or content changes
  useEffect(() => {
    if (!regexPattern || !fileContent || activeTab !== "TEXT") {
      setMatchCount(0);
      return;
    }
    try {
      // Simple heuristic to extract flags if user entered /pattern/flags format
      // Otherwise assume the whole string is the pattern
      let pattern = regexPattern;
      let flags = "g"; // default global

      const match = regexPattern.match(/^\/(.*?)\/([gimsuy]*)$/);
      if (match) {
        pattern = match[1];
        flags = match[2] || "g";
      }

      const regex = new RegExp(pattern, flags);
      const matches = fileContent.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } catch (e) {
      setMatchCount(0);
    }
  }, [regexPattern, fileContent, activeTab]);

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
      if (activeTab === "TEXT") {
        loadFileContent(path);
      }
    }
  };

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

  const renderHighlightedContent = () => {
    if (!fileContent) return null;
    if (!regexPattern || activeTab !== "TEXT") return fileContent;

    try {
      let pattern = regexPattern;
      let flags = "g";
      const match = regexPattern.match(/^\/(.*?)\/([gimsuy]*)$/);
      if (match) {
        pattern = match[1];
        flags = match[2] || "g";
      }
      const regex = new RegExp(`(${pattern})`, flags);
      const parts = fileContent.split(regex);

      // RegExp with capturing group in split returns [pre, match, post, match, ...]
      // However, if the regex is global, it might behave differently or we need to be careful.
      // Actually, String.prototype.split with capturing group includes the captured parts.
      // But simply, we can use a safer approach: react-string-replace or manual splitting.
      // Let's use a manual map approach for simplicity with basic highlighting.

      return parts.map((part, i) => {
        // Even indices are non-matches, odd indices are matches (because of capturing group)
        // But verify if it actually matches the pattern to be safe,
        // though split with capturing group guarantees this structure.
        if (i % 2 === 1) {
          return (
            <span key={i} style={{ backgroundColor: "#ffaa00", color: "#000" }}>
              {part}
            </span>
          );
        }
        return part;
      });
    } catch (e) {
      return fileContent;
    }
  };

  const renderTextTab = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="textOrigin"
              label="正则表达式"
              rules={[{ required: true, message: "请输入正则表达式" }]}
            >
              <Input placeholder="/pattern/flags" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="description" label="配置描述">
              <Input placeholder="Description" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="textTarget"
              label="替换内容"
              rules={[{ required: true, message: "请输入替换内容" }]}
            >
              <Input placeholder="New value" />
            </Form.Item>
          </Col>
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
              label="选中文件"
              rules={[{ required: true }]}
            >
              <Input readOnly placeholder="请从左侧选择文件" />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <div
        style={{
          padding: "8px 16px",
          background: "#333",
          color: "#fff",
          borderBottom: "1px solid #444",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        <Spin spinning={loadingContent}>
          <div>{renderHighlightedContent()}</div>
        </Spin>
      </div>
    </div>
  );

  const renderFileTab = () => (
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
            label="选中文件"
            rules={[{ required: true }]}
          >
            <Input readOnly placeholder="请从左侧选择文件" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="description" label="配置描述">
            <Input placeholder="Description" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="fileTargetUrl"
            label="文件目标URL"
            rules={[{ required: true, message: "请输入文件目标URL" }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Dragger disabled>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">这里是示意区域</p>
          <p className="ant-upload-hint">
            实际替换逻辑由后端构建时下载 fileTargetUrl 覆盖 fileOriginPath
          </p>
        </Dragger>
      </div>
    </div>
  );

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
      width="80%"
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
          width: 300,
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
              <DirectoryTree
                onSelect={handleSelect}
                treeData={treeData}
                // height={800} // Remove fixed height to let flex handle it
                // defaultExpandAll
              />
            ) : (
              <div style={{ padding: 16, textAlign: "center", color: "#999" }}>
                暂无文件或未加载
              </div>
            )}
          </Spin>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Form form={form} layout="vertical" style={{ height: "100%" }}>
          {renderContent()}
        </Form>
      </div>
    </Drawer>
  );
};

export default ConfigEditorDrawer;
