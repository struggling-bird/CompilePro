import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message, Space, Typography, Card, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  getCompilation,
  updateCompilation,
} from "../../../services/compilations";
import { getGlobalConfigs, listModules } from "../../../services/templates";
import {
  Compilation,
  TemplateVersion,
  TemplateModule,
  TemplateModuleConfig,
} from "../../../types";
import styles from "../styles/Detail.module.less";
import GlobalConfigTable from "../../../components/GlobalConfigTable";
import ModuleTabs from "../../../components/ModuleTabs";
import CompilationModal from "../components/CompilationModal";

const { Title } = Typography;

const CompilationDetail: React.FC = () => {
  const { compilationId } = useParams<{ compilationId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Data Sources
  const [compilation, setCompilation] = useState<Compilation>();
  const [selectedTemplateVersion, setSelectedTemplateVersion] =
    useState<TemplateVersion>();

  // Config Values
  const [globalConfigs, setGlobalConfigs] = useState<
    { configId: string; value: string }[]
  >([]);
  const [moduleConfigs, setModuleConfigs] = useState<
    { moduleId: string; configId: string; value: string }[]
  >([]);

  // Initial Fetch
  const loadData = async () => {
    if (!compilationId) return;
    setLoading(true);
    try {
      const data = await getCompilation(compilationId);
      setCompilation(data);

      // Initialize Config Values
      setGlobalConfigs(data.globalConfigs || []);
      setModuleConfigs(data.moduleConfigs || []);

      // Fetch Template Version Details (Schema)
      if (data.templateVersion) {
        await fetchAndSetVersionDetails(data.templateVersion);
      }
    } catch (e) {
      message.error(t.compilationDetail.loadDataFailed);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compilationId]);

  // Helper to fetch details
  const fetchAndSetVersionDetails = async (versionId: string) => {
    try {
      const [globalConfigsRes, modulesRes] = await Promise.all([
        getGlobalConfigs(versionId),
        listModules(versionId),
      ]);
      const globalConfigs =
        (globalConfigsRes as any).data || globalConfigsRes || [];
      const modules = (modulesRes as any).data || modulesRes || [];

      // We need a base object, but we don't fetch the full version list here anymore.
      // So we construct a partial object.
      setSelectedTemplateVersion({
        id: versionId,
        version: t.compilationDetail.loading, // We might not know the version name without fetching the list or version detail
        globalConfigs,
        modules,
      } as TemplateVersion);
    } catch (e) {
      console.error(e);
      message.error(t.compilationDetail.loadTemplateFailed);
    }
  };

  const handleGlobalConfigChange = (configId: string, value: string) => {
    setGlobalConfigs((prev) => {
      const idx = prev.findIndex((c) => c.configId === configId);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], value };
        return next;
      }
      return [...prev, { configId, value }];
    });
  };

  const handleModuleConfigChange = (
    moduleId: string,
    configId: string,
    value: string
  ) => {
    setModuleConfigs((prev) => {
      const idx = prev.findIndex(
        (c) => c.moduleId === moduleId && c.configId === configId
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], value };
        return next;
      }
      return [...prev, { moduleId, configId, value }];
    });
  };

  const usageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (selectedTemplateVersion?.modules) {
      selectedTemplateVersion.modules.forEach((mod: TemplateModule) => {
        mod.configs.forEach((conf: TemplateModuleConfig) => {
          if (conf.mappingType === "GLOBAL" && conf.mappingValue) {
            counts[conf.mappingValue] = (counts[conf.mappingValue] || 0) + 1;
          }
        });
      });
    }
    return counts;
  }, [selectedTemplateVersion]);

  // Save Configs Only
  const onFinish = async () => {
    if (!compilationId) return;

    setSubmitting(true);
    try {
      const payload: Partial<Compilation> = {
        globalConfigs,
        moduleConfigs,
      };

      await updateCompilation(compilationId, payload);
      message.success(t.compilationDetail.saveSuccess);
    } catch (e) {
      message.error(t.compilationDetail.saveFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBasicInfo = async (values: any) => {
    if (!compilationId) return;
    try {
      await updateCompilation(compilationId, values);
      message.success(t.compilationDetail.basicInfoUpdated);
      // Reload data to reflect changes (especially if template changed)
      // Note: If template changed, existing config values might be invalid.
      // Ideally backend handles this, or we clear them.
      // For now, we reload.
      loadData();
    } catch (e) {
      throw e;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.left}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/compilations")}
          />
          <Space align="center" size="small">
            <Title level={4} className={styles.title} style={{ margin: 0 }}>
              {compilation?.name}
            </Title>
            {compilation?.description && (
              <Tooltip title={compilation.description}>
                <InfoCircleOutlined style={{ color: "#999" }} />
              </Tooltip>
            )}
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setEditModalVisible(true)}
            />
          </Space>
        </div>
        <Space>
          <Button onClick={() => navigate("/compilations")}>
            {t.compilationDetail.cancel}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={onFinish}
          >
            {t.compilationDetail.save}
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        {/* Configuration Section */}
        <div className={styles.configSection}>
          <Card title={null} className={styles.card} variant="borderless">
            {selectedTemplateVersion ? (
              <GlobalConfigTable
                configs={selectedTemplateVersion.globalConfigs}
                mode="INSTANCE"
                values={globalConfigs}
                onValueChange={handleGlobalConfigChange}
                usageCounts={usageCounts}
              />
            ) : (
              <div className={styles.emptyState}>
                {t.compilationDetail.templateVersion}
              </div>
            )}
          </Card>

          <Card
            title={t.compilationDetail.moduleConfigTitle}
            className={`${styles.card} ${styles.moduleCard}`}
            variant="borderless"
            style={{ marginTop: 24 }}
          >
            {selectedTemplateVersion ? (
              <ModuleTabs
                modules={selectedTemplateVersion.modules}
                globalConfigs={selectedTemplateVersion.globalConfigs}
                mode="INSTANCE"
                globalConfigValues={globalConfigs}
                values={moduleConfigs}
                onValueChange={handleModuleConfigChange}
              />
            ) : (
              <div className={styles.emptyState}>
                {t.compilationDetail.templateVersion}
              </div>
            )}
          </Card>
        </div>
      </div>

      <CompilationModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleUpdateBasicInfo}
        initialValues={compilation}
        title={t.compilationDetail.editTitle}
      />
    </div>
  );
};

export default CompilationDetail;
