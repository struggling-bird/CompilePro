import React, { useMemo, useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Tooltip,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  TemplateModule,
  TemplateModuleConfig,
  TemplateGlobalConfig,
  CompilationModuleConfig,
  CompilationGlobalConfig,
} from "../../types";
import styles from "./index.module.less";

import { useLanguage } from "../../contexts/LanguageContext";

const { Text } = Typography;

interface ModuleTabsProps {
  modules: TemplateModule[];
  globalConfigs: TemplateGlobalConfig[];
  // Mode
  mode?: "SCHEMA" | "INSTANCE";
  // Schema Mode Props
  onEditConfig?: (moduleId: string, config: TemplateModuleConfig) => void;
  onDeleteConfig?: (moduleId: string, configId: string) => void;
  onAddModule?: () => void;
  onSwitchVersion?: (moduleId: string) => void;
  // Instance Mode Props
  values?: CompilationModuleConfig[];
}

const ModuleTabs: React.FC<ModuleTabsProps> = ({
  modules,
  globalConfigs,
  mode = "SCHEMA",
  onEditConfig,
  onDeleteConfig,
  onAddModule,
  onSwitchVersion,
  values = [],
}) => {
  const { t } = useLanguage();

  // Instance mode: Manually added hidden configs, per module
  const [shownHiddenConfigs, setShownHiddenConfigs] = useState<
    Record<string, string[]>
  >({});

  const valueMap = useMemo(() => {
    return values.reduce((acc, cur) => {
      acc[`${cur.moduleId}:${cur.configId}`] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }, [values]);

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
        width: mode === "INSTANCE" ? "20%" : undefined,
        render: (t: string) => <Text strong>{t}</Text>,
      },
      {
        title:
          mode === "INSTANCE"
            ? t.compilationDetail?.targetValue || "Target Value"
            : t.templateDetail.mapping,
        key: "value",
        width: mode === "INSTANCE" ? "30%" : undefined,
        render: (_: any, r: TemplateModuleConfig) => {
          if (r.mappingType === "GLOBAL")
            return getGlobalConfigName(r.mappingValue);
          if (r.mappingType === "MANUAL") {
            if (!r.mappingValue)
              return <Tag>{t.templateDetail.manualInput}</Tag>;
            return <Text copyable>{r.mappingValue}</Text>;
          }
          return <Text code>{r.mappingValue}</Text>;
        },
      },
      {
        title: t.templateDetail.desc,
        dataIndex: "description",
        key: "description",
        width: mode === "INSTANCE" ? "35%" : undefined,
      },
      {
        title: t.templateDetail.fileLocation,
        dataIndex: "fileLocation",
        key: "fileLocation",
      },
      // Schema Only Columns
      ...(mode === "SCHEMA"
        ? [
            {
              title: t.templateDetail.isHidden,
              dataIndex: "isHidden",
              key: "isHidden",
              render: (v: boolean) =>
                v ? t.templateDetail.yes : t.templateDetail.no,
            },
          ]
        : []),
      {
        title: t.templateDetail.action,
        key: "action",
        width: mode === "INSTANCE" ? "15%" : undefined,
        render: (_: any, r: TemplateModuleConfig) => {
          return (
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEditConfig?.(module.id, r)}
              />
              <Popconfirm
                title={t.templateDetail.delete + "?"}
                onConfirm={() => onDeleteConfig?.(module.id, r.id)}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </Space>
          );
        },
      },
    ];

    const currentShown = shownHiddenConfigs[module.id] || [];

    // Filter hidden configs in INSTANCE mode usually
    const dataSource =
      mode === "INSTANCE"
        ? module.configs.filter(
            (c) =>
              !c.isHidden ||
              currentShown.includes(c.id) ||
              valueMap[`${module.id}:${c.id}`] !== undefined
          )
        : module.configs;

    const hiddenOptions = module.configs.filter(
      (c) =>
        c.isHidden &&
        !currentShown.includes(c.id) &&
        valueMap[`${module.id}:${c.id}`] === undefined
    );

    const handleAddHiddenConfig = (moduleId: string, configId: string) => {
      setShownHiddenConfigs((prev) => ({
        ...prev,
        [moduleId]: [...(prev[moduleId] || []), configId],
      }));
    };

    return (
      <div className={styles.container}>
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {mode === "INSTANCE" && hiddenOptions.length > 0 && (
            <Select
              placeholder={t.compilationDetail.addConfig || "Add Config"}
              style={{ width: 250 }}
              showSearch
              value={null}
              onChange={(val) => handleAddHiddenConfig(module.id, val)}
              filterOption={(input, option) => {
                const config = hiddenOptions.find((c) => c.id === option?.key);
                if (!config) return false;
                const searchStr =
                  `${config.name} ${config.description} ${config.mappingValue}`.toLowerCase();
                return searchStr.includes(input.toLowerCase());
              }}
            >
              {hiddenOptions.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{c.name}</span>
                    <span
                      style={{
                        color: "#999",
                        fontSize: "12px",
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.description}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          )}
        </div>
        <Table
          rowKey="id"
          columns={columns as any}
          dataSource={dataSource}
          pagination={false}
          locale={{ emptyText: t.templateDetail.noData }}
        />
      </div>
    );
  };

  const items = (modules || []).map((m) => ({
    key: m.id,
    label: `${m.projectName} (${m.projectVersion})`,
    children: renderConfigs(m),
  }));

  return (
    <>
      <Tabs
        type="card"
        className={styles.tabs}
        onTabClick={(key) => onSwitchVersion?.(key)}
        items={items}
        tabBarExtraContent={
          mode === "SCHEMA" && (
            <Button
              type="primary"
              ghost
              icon={<PlusOutlined />}
              onClick={onAddModule}
            >
              {t.templateDetail.addModuleTitle}
            </Button>
          )
        }
      />
    </>
  );
};

export default ModuleTabs;
