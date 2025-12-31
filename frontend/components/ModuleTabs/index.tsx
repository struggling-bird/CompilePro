import React, { useMemo, useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Input,
  Tooltip,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  TemplateModule,
  TemplateModuleConfig,
  TemplateGlobalConfig,
  CompilationModuleConfig,
  CompilationGlobalConfig,
} from "../../types";
import { getFile, FileItem } from "../../services/storageAnalysis";
import FilePreviewModal from "../FilePreview/FilePreviewModal";
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
  globalConfigValues?: CompilationGlobalConfig[];
  onValueChange?: (moduleId: string, configId: string, value: string) => void;
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
  globalConfigValues = [],
  onValueChange,
}) => {
  const { t } = useLanguage();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

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

  const globalValueMap = useMemo(() => {
    return globalConfigValues.reduce((acc, cur) => {
      acc[cur.configId] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }, [globalConfigValues]);

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

  const getGlobalConfigRawName = (id: string) => {
    const gc = globalConfigs.find((g) => g.id === id);
    return gc ? gc.name : id;
  };

  const isGlobalConfigFile = (id: string) => {
    const gc = globalConfigs.find((g) => g.id === id);
    return gc?.type === "FILE";
  };

  const getGlobalConfigDefaultValue = (id: string) => {
    const gc = globalConfigs.find((g) => g.id === id);
    return gc?.defaultValue;
  };

  const handlePreview = async (fileId: string) => {
    if (!fileId) return;
    try {
      const file = await getFile(fileId);
      setPreviewFile(file);
      setPreviewVisible(true);
    } catch (e) {
      console.error(e);
    }
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
            (c) => !c.isHidden || currentShown.includes(c.id)
          )
        : module.configs;

    const hiddenOptions = module.configs.filter(
      (c) => c.isHidden && !currentShown.includes(c.id)
    );

    const menuProps = {
      items: hiddenOptions.map((c) => ({
        key: c.id,
        label: `${c.name} (${c.description})`,
      })),
      onClick: ({ key }: any) =>
        setShownHiddenConfigs((prev) => ({
          ...prev,
          [module.id]: [...(prev[module.id] || []), key],
        })),
    };

    return (
      <div className={styles.container}>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {mode === "INSTANCE" && hiddenOptions.length > 0 && (
            <Dropdown menu={menuProps} trigger={["click"]}>
              <Button size="small" icon={<PlusOutlined />}>
                {t.compilationDetail.addConfig || "Add Config"}
              </Button>
            </Dropdown>
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
    <div>
      <Tabs
        type="card"
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
      <FilePreviewModal
        visible={previewVisible}
        file={previewFile}
        onCancel={() => setPreviewVisible(false)}
      />
    </div>
  );
};

export default ModuleTabs;
