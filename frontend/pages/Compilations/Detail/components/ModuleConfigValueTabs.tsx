import React, { useMemo } from "react";
import { Tabs, Table, Input, Typography, Button, Tag, Space } from "antd";
import {
  TemplateModule,
  TemplateModuleConfig,
  CompilationModuleConfig,
  TemplateGlobalConfig,
} from "../../../../types";
import { useLanguage } from "../../../../contexts/LanguageContext";

const { Text } = Typography;

interface ModuleConfigValueTabsProps {
  modules: TemplateModule[];
  globalConfigs: TemplateGlobalConfig[];
  values: CompilationModuleConfig[];
  onChange: (moduleId: string, configId: string, value: string) => void;
}

const ModuleConfigValueTabs: React.FC<ModuleConfigValueTabsProps> = ({
  modules,
  globalConfigs,
  values,
  onChange,
}) => {
  const { t } = useLanguage();

  const valueMap = useMemo(() => {
    return values.reduce((acc, cur) => {
      acc[`${cur.moduleId}:${cur.configId}`] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }, [values]);

  const getGlobalConfigName = (id: string) => {
    const gc = globalConfigs.find((g) => g.id === id);
    return gc ? gc.name : id;
  };

  const renderConfigs = (module: TemplateModule) => {
    const columns = [
      {
        title: t.compilationDetail.configName || "Name",
        dataIndex: "name",
        key: "name",
        width: "20%",
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: t.compilationDetail.targetValue || "Target Value",
        key: "value",
        width: "30%",
        render: (_: any, record: TemplateModuleConfig) => {
          if (record.mappingType === "FIXED") {
            return (
              <Input value={record.mappingValue} disabled />
            );
          }
          
          if (record.mappingType === "GLOBAL") {
             const globalName = getGlobalConfigName(record.mappingValue);
             return (
               <Space>
                 <Input value={globalName} disabled />
                 <Tag color="orange">{t.templateDetail.mapToGlobal}</Tag>
               </Space>
             )
          }

          // MANUAL or default
          const val = valueMap[`${module.id}:${record.id}`] ?? "";
          return (
            <Input
              value={val}
              onChange={(e) => onChange(module.id, record.id, e.target.value)}
              placeholder={t.compilationDetail.manualInput || "Enter value"}
            />
          );
        },
      },
      {
        title: t.compilationDetail.desc || "Description",
        dataIndex: "description",
        key: "description",
        width: "35%",
      },
      {
        title: t.compilationList.action || "Action",
        key: "action",
        width: "15%",
        render: () => (
          <Button type="link" size="small">
            {t.compilationDetail.detail || "View Detail"}
          </Button>
        ),
      },
    ];

    // Filter hidden configs? Usually yes, unless admin.
    const visibleConfigs = module.configs.filter(c => !c.isHidden);

    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={visibleConfigs}
        pagination={false}
        size="small"
        bordered
      />
    );
  };

  const items = (modules || []).map((m) => ({
    key: m.id,
    label: `${m.projectName} (${m.projectVersion})`,
    children: renderConfigs(m),
  }));

  return (
    <Tabs
      type="card"
      items={items}
      className="module-config-tabs"
    />
  );
};

export default ModuleConfigValueTabs;
