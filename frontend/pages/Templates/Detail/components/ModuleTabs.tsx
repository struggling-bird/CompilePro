import React from "react";
import { Tabs, Table, Button, Tag, Space, Typography, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  TemplateModule,
  TemplateModuleConfig,
  TemplateGlobalConfig,
} from "../../../../types";

import { useLanguage } from "../../../../contexts/LanguageContext";

const { Text } = Typography;

interface ModuleTabsProps {
  modules: TemplateModule[];
  globalConfigs: TemplateGlobalConfig[];
  onAddConfig: (moduleId: string) => void;
  onEditConfig: (moduleId: string, config: TemplateModuleConfig) => void;
  onDeleteConfig: (moduleId: string, configId: string) => void;
  onAddModule: () => void;
  onSwitchVersion: (moduleId: string) => void;
}

const ModuleTabs: React.FC<ModuleTabsProps> = ({
  modules,
  globalConfigs,
  onAddConfig,
  onEditConfig,
  onDeleteConfig,
  onAddModule,
  onSwitchVersion,
}) => {
  const { t } = useLanguage();

  const getGlobalConfigName = (id: string) => {
    const gc = globalConfigs.find((g) => g.id === id);
    return gc ? (
      <Tag color="orange">
        {t.templateDetail.mapToGlobal}: {gc.name}
      </Tag>
    ) : (
      <Tag color="error">Unknown</Tag>
    );
  };

  const renderConfigs = (module: TemplateModule) => {
    const columns = [
      {
        title: t.templateDetail.name,
        dataIndex: "name",
        key: "name",
        render: (t: string) => <Text strong>{t}</Text>,
      },
      {
        title: t.templateDetail.mapping,
        key: "value",
        render: (_: any, r: TemplateModuleConfig) => {
          if (r.mappingType === "GLOBAL")
            return getGlobalConfigName(r.mappingValue);
          if (r.mappingType === "MANUAL") {
            // For FILE type, mappingValue might be a file ID
            // Simple heuristic: if it looks like a UUID, maybe show "File ID: ..." or just the value
            // But user asked for "real target value"
            // If it's empty, show manual input placeholder
            if (!r.mappingValue) return <Tag>{t.templateDetail.manualInput}</Tag>;
            return <Text copyable>{r.mappingValue}</Text>;
          }
          return <Text code>{r.mappingValue}</Text>;
        },
      },
      {
        title: t.templateDetail.desc,
        dataIndex: "description",
        key: "description",
      },
      {
        title: t.templateDetail.fileLocation,
        dataIndex: "fileLocation",
        key: "fileLocation",
      },
      {
        title: t.templateDetail.isHidden,
        dataIndex: "isHidden",
        key: "isHidden",
        render: (v: boolean) =>
          v ? t.templateDetail.yes : t.templateDetail.no,
      },
      {
        title: t.templateDetail.action,
        key: "action",
        render: (_: any, r: TemplateModuleConfig) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditConfig(module.id, r)}
            />
            <Popconfirm
              title={t.templateDetail.delete + "?"}
              onConfirm={() => onDeleteConfig(module.id, r.id)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: 12, textAlign: "right" }}>
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => onAddConfig(module.id)}
          >
            {t.templateDetail.addGlobalConfig}
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={columns as any}
          dataSource={module.configs}
          pagination={false}
          size="small"
          locale={{ emptyText: t.templateDetail.noData }}
        />
      </div>
    );
  };

  const items = modules.map((m) => ({
    key: m.id,
    label: `${m.projectName} (${m.projectVersion})`,
    children: renderConfigs(m),
  }));

  return (
    <div>
      <Tabs
        type="card"
        onTabClick={(key) => onSwitchVersion(key)}
        items={items}
        tabBarExtraContent={
          <Button
            type="primary"
            ghost
            icon={<PlusOutlined />}
            onClick={onAddModule}
          >
            {t.templateDetail.addModuleTitle}
          </Button>
        }
      />
    </div>
  );
};

export default ModuleTabs;
