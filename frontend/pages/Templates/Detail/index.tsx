import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  message,
  Space,
  Typography,
  Spin,
  Tabs,
  Modal,
  Drawer,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { MOCK_TEMPLATES } from "../../../constants";
import {
  ProjectTemplate,
  TemplateVersion,
  TemplateGlobalConfig,
  TemplateModuleConfig,
  TemplateModule,
} from "../../../types";
import VersionTimeline from "./components/VersionTimeline";
import GlobalConfigTable from "./components/GlobalConfigTable";
import ModuleTabs from "./components/ModuleTabs";
import ConfigForm from "./components/ConfigForm";
import VersionCreationModal, {
  VersionCreationValues,
} from "./components/VersionCreationModal";
import styles from "../styles/Detail.module.less";
import dayjs from "dayjs";
import { useLanguage } from "../../../contexts/LanguageContext";

const { Title, Text } = Typography;

const TemplateDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string>("");

  // Config Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"GLOBAL" | "MODULE">("GLOBAL");
  const [editingConfig, setEditingConfig] = useState<
    TemplateGlobalConfig | TemplateModuleConfig | undefined
  >(undefined);
  const [activeModuleId, setActiveModuleId] = useState<string | undefined>(
    undefined
  );

  // Version Creation Modal
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  // Version Drawer State
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);

  useEffect(() => {
    // Determine the actual ID from URL.
    // If route is /templates/new, templateId will be undefined if we strictly follow param matching,
    // BUT since we defined /templates/:templateId, "new" is matched as templateId.
    // However, we also defined /templates/new explicitly BEFORE /templates/:templateId in routes config.
    // Let's check how router behaves.
    // If the path is exactly /templates/new, param might be empty depending on router setup.

    // In our routes config:
    // { path: "/templates/new", component: Pages.TemplateDetail } -> templateId param is undefined here
    // { path: "/templates/:templateId", component: Pages.TemplateDetail } -> templateId param is "something"

    // So we should check if templateId exists. If undefined, it means "new".
    // If templateId === "new", it also means "new" (if caught by the dynamic route).

    const isNew = !templateId || templateId === "new";

    setLoading(true);
    setTimeout(() => {
      if (!isNew) {
        const found = MOCK_TEMPLATES.find((t) => t.id === templateId);
        if (found) {
          setTemplate(JSON.parse(JSON.stringify(found)));
          const latest = found.versions[found.versions.length - 1];
          setCurrentVersionId(latest?.id || "");
        } else {
          // Handle not found? For now just init new or show error
          message.error("Template not found");
        }
      } else {
        // Init new template
        // Force user to create initial version via modal
        setTemplate({
          id: "new",
          name: "New Template",
          latestVersion: "",
          isEnabled: true,
          versions: [], // Empty versions initially
        });
        setCurrentVersionId("");
        setVersionModalVisible(true);
      }
      setLoading(false);
    }, 500);
  }, [templateId]);

  const currentVersion = useMemo(() => {
    return template?.versions.find((v) => v.id === currentVersionId);
  }, [template, currentVersionId]);

  const usageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!currentVersion) return counts;

    currentVersion.modules.forEach((mod) => {
      mod.configs.forEach((cfg) => {
        if (cfg.mappingType === "GLOBAL") {
          counts[cfg.mappingValue] = (counts[cfg.mappingValue] || 0) + 1;
        }
      });
    });
    return counts;
  }, [currentVersion]);

  // Handlers
  const handleAddVersion = () => {
    setVersionModalVisible(true);
  };

  const handleCreateBranchFrom = (versionId: string) => {
    // We can pre-select the version in modal by setting currentVersionId
    setCurrentVersionId(versionId);
    setVersionModalVisible(true);
  };

  const handleMerge = (sourceId: string) => {
    // Find source version
    if (!template) return;
    const source = template.versions.find((v) => v.id === sourceId);
    if (!source) return;

    // Simple Merge Logic:
    // 1. Find parent (target)
    // 2. If parent exists, just show success message for now.
    // In real app, we might need a Merge Modal to resolve conflicts or confirm details.

    if (source.baseVersion) {
      const target = template.versions.find((v) => v.id === source.baseVersion);
      if (target) {
        message.success(`Merged ${source.version} into ${target.version}`);
        // Logic to update target version with changes...
      } else {
        message.warning("Base version not found");
      }
    } else {
      message.warning("No base version to merge into");
    }
  };

  const handleCreateVersion = (values: VersionCreationValues) => {
    if (!template) return;

    let newVer: TemplateVersion;

    if (template.versions.length === 0) {
      // Initial Version Creation
      newVer = {
        id: `v${Date.now()}`,
        version: values.version, // Should be "1.0.0"
        date: dayjs().format("YYYY.MM.DD"),
        isBranch: false,
        baseVersion: undefined,
        description: values.description,
        versionType: "Major",
        status: "Active",
        globalConfigs: [],
        modules: [],
      };
    } else {
      const parent = template.versions.find(
        (v) => v.id === values.parentVersionId
      );
      if (!parent) return;

      newVer = {
        ...JSON.parse(JSON.stringify(parent)),
        id: `v${Date.now()}`,
        version: values.version,
        date: dayjs().format("YYYY.MM.DD"),
        isBranch: values.versionType === "Branch" || parent.isBranch,
        baseVersion: parent.id,
        description: values.description,
        versionType: values.versionType,
      };
    }

    setTemplate({
      ...template,
      versions: [...template.versions, newVer],
    });
    setCurrentVersionId(newVer.id);
    message.success("New version created successfully");
    setVersionModalVisible(false);
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!template) return;
    // Prevent deleting the last remaining version
    if (template.versions.length <= 1) {
      message.warning("Cannot delete the only version");
      return;
    }

    Modal.confirm({
      title: "Delete Version",
      content:
        "Are you sure you want to delete this version? This action cannot be undone.",
      onOk: () => {
        const newVersions = template.versions.filter((v) => v.id !== versionId);
        setTemplate({ ...template, versions: newVersions });

        if (currentVersionId === versionId) {
          // Switch to another version, preferably previous one or last one
          setCurrentVersionId(newVersions[newVersions.length - 1].id);
        }
        message.success("Version deleted");
      },
    });
  };

  const handleGlobalConfig = (
    action: "ADD" | "EDIT" | "DELETE",
    config?: TemplateGlobalConfig
  ) => {
    if (!currentVersion || !template) return;

    if (action === "DELETE" && config) {
      const updatedGlobal = currentVersion.globalConfigs.filter(
        (c) => c.id !== config.id
      );
      updateCurrentVersion({ ...currentVersion, globalConfigs: updatedGlobal });
    } else {
      setModalMode("GLOBAL");
      setEditingConfig(config);
      setModalVisible(true);
    }
  };

  const handleModuleConfig = (
    moduleId: string,
    action: "ADD" | "EDIT" | "DELETE",
    config?: TemplateModuleConfig
  ) => {
    if (!currentVersion || !template) return;

    if (action === "DELETE" && config) {
      const updatedModules = currentVersion.modules.map((m) => {
        if (m.id === moduleId) {
          return { ...m, configs: m.configs.filter((c) => c.id !== config.id) };
        }
        return m;
      });
      updateCurrentVersion({ ...currentVersion, modules: updatedModules });
    } else {
      setModalMode("MODULE");
      setActiveModuleId(moduleId);
      setEditingConfig(config);
      setModalVisible(true);
    }
  };

  const handleSaveModal = (values: any) => {
    if (!currentVersion) return;

    if (modalMode === "GLOBAL") {
      const newConfig = {
        ...values,
        id: editingConfig?.id || `g${Date.now()}`,
      };
      let newGlobalConfigs = [...currentVersion.globalConfigs];
      if (editingConfig?.id) {
        newGlobalConfigs = newGlobalConfigs.map((c) =>
          c.id === editingConfig.id ? newConfig : c
        );
      } else {
        newGlobalConfigs.push(newConfig);
      }
      updateCurrentVersion({
        ...currentVersion,
        globalConfigs: newGlobalConfigs,
      });
    } else {
      if (!activeModuleId) return;
      const newConfig = {
        ...values,
        id: editingConfig?.id || `c${Date.now()}`,
      };
      const updatedModules = currentVersion.modules.map((m) => {
        if (m.id === activeModuleId) {
          let newConfigs = [...m.configs];
          if (editingConfig?.id) {
            newConfigs = newConfigs.map((c) =>
              c.id === editingConfig.id ? newConfig : c
            );
          } else {
            newConfigs.push(newConfig);
          }
          return { ...m, configs: newConfigs };
        }
        return m;
      });
      updateCurrentVersion({ ...currentVersion, modules: updatedModules });
    }
    setModalVisible(false);
  };

  const updateCurrentVersion = (newVersion: TemplateVersion) => {
    if (!template) return;
    const newVersions = template.versions.map((v) =>
      v.id === newVersion.id ? newVersion : v
    );
    setTemplate({ ...template, versions: newVersions });
  };

  const handleAddModule = () => {
    if (!currentVersion) return;
    const newModule: TemplateModule = {
      id: `m${Date.now()}`,
      projectId: "new",
      projectName: "New Meta Project",
      projectVersion: "1.0.0",
      publishMethod: "GIT",
      configs: [],
    };
    updateCurrentVersion({
      ...currentVersion,
      modules: [...currentVersion.modules, newModule],
    });
  };

  const handleSaveTemplate = () => {
    message.loading("Saving template...", 1).then(() => {
      message.success("Template saved successfully!");
      // Here you would call API to save 'template' state
    });
  };

  if (loading || !template)
    return (
      <Spin size="large" style={{ display: "block", margin: "100px auto" }} />
    );
  // Allow rendering if we are in "new template" mode (empty versions) to show the modal
  if (!currentVersion && template.versions.length > 0)
    return <div>Version not found</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/templates")}
          >
            {t.templateDetail.back}
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {template.id === "new" && template.name === "New Template"
              ? t.templateDetail.newTitle
              : template.name}{" "}
            {currentVersion && (
              <Text
                type="secondary"
                style={{
                  fontSize: 14,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setVersionDrawerOpen(true)}
              >
                v{currentVersion.version} <BranchesOutlined />
              </Text>
            )}
          </Title>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSaveTemplate}
          disabled={!currentVersion} // Disable save if no version
        >
          {t.templateDetail.save}
        </Button>
      </div>

      <Drawer
        title="Version Graph"
        placement="bottom"
        onClose={() => setVersionDrawerOpen(false)}
        open={versionDrawerOpen}
        destroyOnHidden
        size={510}
      >
        <VersionTimeline
          versions={template.versions}
          currentVersionId={currentVersionId}
          onChange={setCurrentVersionId}
          onAddVersion={handleAddVersion}
          onCreateBranchFrom={handleCreateBranchFrom}
          onMerge={handleMerge}
          onDelete={handleDeleteVersion}
          onStatusChange={(versionId, status, reason) => {
            if (!template) return;
            // Update version status
            const newVersions = template.versions.map((v) => {
              if (v.id === versionId) {
                return {
                  ...v,
                  status,
                  description: reason
                    ? `${v.description || ""}\n[Deprecated Reason]: ${reason}`
                    : v.description,
                };
              }
              return v;
            });
            setTemplate({ ...template, versions: newVersions });
            message.success(
              `Version ${status === "Deprecated" ? "disabled" : "enabled"}`
            );
          }}
        />
      </Drawer>

      {currentVersion && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>{t.templateDetail.globalConfigTitle}</span>
            </div>
            <div className={styles.configTable}>
              <GlobalConfigTable
                configs={currentVersion.globalConfigs}
                usageCounts={usageCounts}
                onAdd={() => handleGlobalConfig("ADD")}
                onEdit={(c) => handleGlobalConfig("EDIT", c)}
                onDelete={(id) => handleGlobalConfig("DELETE", { id } as any)}
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>{t.templateDetail.moduleConfigTitle}</span>
            </div>
            <div className={styles.moduleTabs}>
              <ModuleTabs
                modules={currentVersion.modules}
                globalConfigs={currentVersion.globalConfigs}
                onAddModule={handleAddModule}
                onAddConfig={(mid) => handleModuleConfig(mid, "ADD")}
                onEditConfig={(mid, c) => handleModuleConfig(mid, "EDIT", c)}
                onDeleteConfig={(mid, cid) =>
                  handleModuleConfig(mid, "DELETE", { id: cid } as any)
                }
              />
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>{t.templateDetail.docsTitle}</span>
            </div>
            <Tabs
              items={[
                {
                  key: "build",
                  label: t.templateDetail.build,
                  children: (
                    <div
                      style={{
                        padding: 16,
                        background: "#fafafa",
                        borderRadius: 4,
                        minHeight: 200,
                      }}
                    >
                      <div>
                        {currentVersion.buildDoc || t.templateDetail.noData}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "update",
                  label: t.templateDetail.update,
                  children: (
                    <div
                      style={{
                        padding: 16,
                        background: "#fafafa",
                        borderRadius: 4,
                        minHeight: 200,
                      }}
                    >
                      <div>
                        {currentVersion.updateDoc || t.templateDetail.noData}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <ConfigForm
            visible={modalVisible}
            mode={modalMode}
            initialValues={editingConfig}
            globalConfigs={currentVersion.globalConfigs}
            onCancel={() => setModalVisible(false)}
            onSave={handleSaveModal}
          />
        </>
      )}

      {template && (
        <VersionCreationModal
          visible={versionModalVisible}
          onCancel={() => {
            // If cancelling initial creation, maybe navigate back?
            if (template.versions.length === 0) {
              navigate("/templates");
            } else {
              setVersionModalVisible(false);
            }
          }}
          onCreate={handleCreateVersion}
          versions={template.versions}
          currentVersionId={currentVersionId}
        />
      )}
    </div>
  );
};

export default TemplateDetailPage;
