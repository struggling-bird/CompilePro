import React, { useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Space,
  Typography,
  Card,
  Row,
  Col,
} from "antd";
import {
  TemplateGlobalConfig,
  TemplateModuleConfig,
  TemplateVersion,
  CompilationGlobalConfig,
  CompilationModuleConfig,
} from "../../../../types";
import { useLanguage } from "../../../../contexts/LanguageContext";

const { Text } = Typography;

interface ConfigFormRenderProps {
  templateVersion: TemplateVersion;
  globalConfigs: CompilationGlobalConfig[]; // Current values
  moduleConfigs: CompilationModuleConfig[]; // Current values
  onGlobalConfigChange: (configId: string, value: string) => void;
  onModuleConfigChange: (
    moduleId: string,
    configId: string,
    value: string
  ) => void;
}

const ConfigFormRender: React.FC<ConfigFormRenderProps> = ({
  templateVersion,
  globalConfigs,
  moduleConfigs,
  onGlobalConfigChange,
  onModuleConfigChange,
}) => {
  const { t } = useLanguage();

  const globalConfigMap = useMemo(() => {
    return globalConfigs.reduce((acc, cur) => {
      acc[cur.configId] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }, [globalConfigs]);

  const moduleConfigMap = useMemo(() => {
    return moduleConfigs.reduce((acc, cur) => {
      acc[`${cur.moduleId}:${cur.configId}`] = cur.value;
      return acc;
    }, {} as Record<string, string>);
  }, [moduleConfigs]);

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      {/* Global Configs */}
      {templateVersion.globalConfigs.length > 0 && (
        <Card title={t.compilationDetail.globalConfigTitle} size="small">
          {templateVersion.globalConfigs.map((config) => (
            <Form.Item
              key={config.id}
              label={config.name}
              help={config.description}
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t.compilationDetail.defaultValue}: {config.defaultValue}
                </Text>
              }
            >
              {config.type === "TEXT" ? (
                <Input
                  value={globalConfigMap[config.id] ?? config.defaultValue}
                  onChange={(e) =>
                    onGlobalConfigChange(config.id, e.target.value)
                  }
                  placeholder={config.defaultValue}
                />
              ) : (
                // File input placeholder - in real app, use upload or file selector
                <Input
                  value={globalConfigMap[config.id] ?? config.defaultValue}
                  onChange={(e) =>
                    onGlobalConfigChange(config.id, e.target.value)
                  }
                  placeholder={config.defaultValue}
                />
              )}
            </Form.Item>
          ))}
        </Card>
      )}

      {/* Module Configs */}
      {templateVersion.modules.map((module) => {
        // Filter visible configs or handle logic for mappingType
        // If mappingType is GLOBAL, it might be read-only or hidden
        const visibleConfigs = module.configs.filter((c) => !c.isHidden);

        if (visibleConfigs.length === 0) return null;

        return (
          <Card
            key={module.id}
            title={`${t.compilationDetail.module}: ${module.projectName} (${module.projectVersion})`}
            size="small"
          >
            {visibleConfigs.map((config) => (
              <Form.Item
                key={config.id}
                label={config.name}
                help={config.description}
                extra={
                  config.mappingType === "FIXED" ? (
                    <Text type="secondary">
                      {t.templateDetail.fixedValue}: {config.mappingValue}
                    </Text>
                  ) : config.mappingType === "GLOBAL" ? (
                    <Text type="secondary">
                      {t.templateDetail.mapToGlobal}:{" "}
                      {
                        templateVersion.globalConfigs.find(
                          (g) => g.id === config.mappingValue
                        )?.name
                      }
                    </Text>
                  ) : null
                }
              >
                {config.mappingType === "MANUAL" ? (
                  <Input
                    value={moduleConfigMap[`${module.id}:${config.id}`] ?? ""}
                    onChange={(e) =>
                      onModuleConfigChange(module.id, config.id, e.target.value)
                    }
                    placeholder={t.templateDetail?.manualInput}
                  />
                ) : (
                  <Input
                    disabled
                    value={
                      config.mappingType === "FIXED"
                        ? config.mappingValue
                        : config.mappingType === "GLOBAL"
                        ? globalConfigMap[config.mappingValue] ??
                          templateVersion.globalConfigs.find(
                            (g) => g.id === config.mappingValue
                          )?.defaultValue
                        : ""
                    }
                  />
                )}
              </Form.Item>
            ))}
          </Card>
        );
      })}
    </Space>
  );
};

export default ConfigFormRender;
