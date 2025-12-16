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
import {
  SaveOutlined,
  InboxOutlined,
} from "@ant-design/icons";
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

  useEffect(() => {
    if (visible) {
      if (config) {
        setActiveTab(config.type);
        form.setFieldsValue(config);
        if (config.fileOriginPath) {
            setSelectedFile(config.fileOriginPath);
            // If it's TEXT mode, we should try to load the content if we can
            if (config.type === 'TEXT') {
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
            {/* 
              TODO: Add Global checkbox if needed by backend. 
              Currently UpsertConfigDto doesn't explicitly have 'isGlobal', 
              but user wireframe has it. Assuming regex flags handle 'g'.
            */}
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
             <Form.Item name="fileOriginPath" label="选中文件" rules={[{ required: true }]}>
               <Input readOnly placeholder="请从左侧选择文件" />
             </Form.Item>
           </Col>
        </Row>
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          padding: 16,
          overflow: "auto",
        }}
      >
        <Spin spinning={loadingContent}>
          <pre>{fileContent}</pre>
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
             <Form.Item name="fileOriginPath" label="选中文件" rules={[{ required: true }]}>
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
       
      <div style={{ marginTop: 24, textAlign: 'center' }}>
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
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
            保存
          </Button>
        </Space>
      }
      styles={{ body: { padding: 0, display: "flex" } }}
    >
      <div style={{ width: 300, borderRight: "1px solid #f0f0f0", padding: 8, display: 'flex', flexDirection: 'column' }}>
        <Spin spinning={loadingFiles}>
            {treeData.length > 0 ? (
                <DirectoryTree
                    onSelect={handleSelect}
                    treeData={treeData}
                    height={800} 
                    defaultExpandAll
                />
            ) : (
                <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
                    暂无文件或未加载
                </div>
            )}
        </Spin>
      </div>
      <div style={{ flex: 1 }}>
        <Form form={form} layout="vertical" style={{ height: '100%' }}>
            {renderContent()}
        </Form>
      </div>
    </Drawer>
  );
};

export default ConfigEditorDrawer;
