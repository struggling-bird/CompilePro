import React, { useState } from "react";
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
} from "antd";
import {
  SaveOutlined,
  FolderOutlined,
  FileOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useLanguage } from "@/contexts/LanguageContext";

const { TextArea } = Input;
const { DirectoryTree } = Tree;

interface FileEditorDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const FileEditorDrawer: React.FC<FileEditorDrawerProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("TEXT");

  const treeData = [
    {
      title: "src",
      key: "0-0",
      children: [
        {
          title: "components",
          key: "0-0-0",
          children: [
            { title: "Button.tsx", key: "0-0-0-0", isLeaf: true },
            { title: "Header.tsx", key: "0-0-0-1", isLeaf: true },
          ],
        },
        {
          title: "assets",
          key: "0-0-1",
          children: [{ title: "logo.png", key: "0-0-1-0", isLeaf: true }],
        },
        { title: "package.json", key: "0-0-2", isLeaf: true },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "TEXT":
        return (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Input
                    placeholder="/pattern/flags"
                    addonBefore={t.projectDetail.regexLabel}
                  />
                  <Checkbox style={{ marginTop: 8 }}>
                    {t.projectDetail.globalLabel}
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Input
                    placeholder="Description"
                    addonBefore={t.projectDetail.descLabel}
                  />
                </Col>
                <Col span={24} style={{ marginTop: 16 }}>
                  <Input
                    placeholder="New value"
                    addonBefore={t.projectDetail.replacementLabel}
                  />
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
              <pre>...</pre>
            </div>
          </div>
        );
      case "FILE":
        return <div style={{ padding: 16 }}>File Upload UI</div>;
      case "JSON":
        return <div style={{ padding: 16 }}>JSON Editor</div>;
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
            { key: "TEXT", label: t.projectDetail.textReplace },
            { key: "FILE", label: t.projectDetail.fileReplace },
            { key: "JSON", label: t.projectDetail.jsonReplace },
          ]}
        />
      }
      placement="right"
      style={{ width: "100%" }}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
          <Button onClick={onClose}>{t.projectDetail.cancel}</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={onClose}>
            {t.projectDetail.save}
          </Button>
        </Space>
      }
      styles={{ body: { padding: 0, display: "flex" } }}
    >
      <div style={{ width: 250, borderRight: "1px solid #f0f0f0", padding: 8 }}>
        <DirectoryTree multiple defaultExpandAll treeData={treeData} />
      </div>
      <div style={{ flex: 1 }}>{renderContent()}</div>
    </Drawer>
  );
};

export default FileEditorDrawer;
