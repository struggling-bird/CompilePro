import React, { useState, useEffect } from "react";
import { Tabs, Modal, Form, Select, Radio, Space } from "antd";
import { TemplateModule, TemplateGlobalConfig } from "../../../../types";
import MetaProjectConfigTable from "./MetaProjectConfigTable";

interface MetaProjectTabsProps {
  modules: TemplateModule[];
  onChange: (modules: TemplateModule[]) => void;
  globalConfigs: TemplateGlobalConfig[];
  isBranch?: boolean;
}

// Mock Data - In real app, fetch from API
const MOCK_PROJECTS = [
  {
    id: "p1",
    name: "webapp",
    versions: [
      {
        version: "1.0.0",
        configs: [
          {
            id: "c1",
            name: "域名",
            fileLocation: "/config.js",
            mappingType: "GLOBAL" as const,
            mappingValue: "",
            regex: "/origin/",
            description: "分析平台网站主域名",
            isHidden: true,
            isSelected: false,
          },
        ],
      },
      { version: "1.0.1", configs: [] },
    ],
  },
  {
    id: "p2",
    name: "sdk",
    versions: [
      {
        version: "1.2.1",
        configs: [
          {
            id: "c2",
            name: "API地址",
            fileLocation: "/src/constants.ts",
            mappingType: "FIXED" as const,
            mappingValue: "https://api.example.com",
            regex: "",
            description: "API Base URL",
            isHidden: false,
            isSelected: true,
          },
        ],
      },
    ],
  },
  { id: "p3", name: "zgsee", versions: [{ version: "2.0.0", configs: [] }] },
];

const MetaProjectTabs: React.FC<MetaProjectTabsProps> = ({
  modules = [],
  onChange,
  globalConfigs,
  isBranch = false,
}) => {
  const [activeKey, setActiveKey] = useState<string>(modules[0]?.id || "add");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();

  // For selecting project/version
  const selectedProjectId = Form.useWatch("projectId", addForm);
  const selectedProject = MOCK_PROJECTS.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    if (modules.length > 0 && activeKey === "add") {
      setActiveKey(modules[0].id);
    }
  }, [modules]);

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      const project = MOCK_PROJECTS.find((p) => p.id === values.projectId);
      const versionData = project?.versions.find(
        (v) => v.version === values.version
      );

      const newModule: TemplateModule = {
        id: Date.now().toString(),
        projectId: values.projectId,
        projectName: project?.name || "",
        projectVersion: values.version,
        publishMethod: "GIT", // Default
        configs: versionData?.configs.map((c: any) => ({ ...c })) || [], // Clone configs
      };

      const newModules = [...modules, newModule];
      onChange(newModules);
      setActiveKey(newModule.id);
      setIsAddModalVisible(false);
      addForm.resetFields();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string
  ) => {
    const newModules = modules.filter((m) => m.id !== targetKey);
    onChange(newModules);
    if (newModules.length > 0 && activeKey === targetKey) {
      setActiveKey(newModules[0].id);
    }
  };

  const onEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action === "add") {
      setIsAddModalVisible(true);
    } else {
      handleRemove(targetKey);
    }
  };

  const handleModuleConfigChange = (moduleId: string, newConfigs: any[]) => {
    const newModules = modules.map((m) =>
      m.id === moduleId ? { ...m, configs: newConfigs } : m
    );
    onChange(newModules);
  };

  const handlePublishMethodChange = (
    moduleId: string,
    method: "GIT" | "DOWNLOAD"
  ) => {
    const newModules = modules.map((m) =>
      m.id === moduleId ? { ...m, publishMethod: method } : m
    );
    onChange(newModules);
  };

  const items = modules.map((module) => ({
    label: `${module.projectName}-${module.projectVersion}`,
    key: module.id,
    children: (
      <div
        style={{
          padding: 16,
          background: "#fff",
          border: "1px solid #f0f0f0",
          borderTop: "none",
        }}
      >
        <MetaProjectConfigTable
          value={module.configs}
          onChange={(newConfigs) =>
            handleModuleConfigChange(module.id, newConfigs)
          }
          globalConfigs={globalConfigs}
          isBranch={isBranch}
        />
        <div style={{ marginTop: 16, display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: 8 }}>发布方式:</span>
          <Radio.Group
            value={module.publishMethod}
            onChange={(e) =>
              handlePublishMethodChange(module.id, e.target.value)
            }
          >
            <Radio value="GIT">发布到git</Radio>
            <Radio value="DOWNLOAD">下载</Radio>
          </Radio.Group>
        </div>
      </div>
    ),
  }));

  return (
    <div>
      <Tabs
        type="editable-card"
        onChange={setActiveKey}
        activeKey={activeKey}
        onEdit={onEdit}
        items={items}
        hideAdd={false}
        className="meta-project-tabs"
      />

      <Modal
        title="添加元项目"
        open={isAddModalVisible}
        onOk={handleAdd}
        onCancel={() => setIsAddModalVisible(false)}
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="projectId"
            label="元项目"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择元项目">
              {MOCK_PROJECTS.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="version" label="版本" rules={[{ required: true }]}>
            <Select placeholder="选择版本" disabled={!selectedProjectId}>
              {selectedProject?.versions.map((v: any) => (
                <Select.Option key={v.version} value={v.version}>
                  {v.version}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MetaProjectTabs;
