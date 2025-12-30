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
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  EditOutlined,
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
import {
  createTemplate,
  getTemplateDetail,
  getTemplateVersions,
  updateTemplate,
} from "../../../services/templates";

const { Title, Text } = Typography;

// Helper to build version tree structure
const processVersions = (versions: TemplateVersion[]): TemplateVersion[] => {
  // Create a deep copy of versions to avoid mutating read-only objects from props/state directly if needed
  // But here we want to return a new array with new objects
  const processed = versions.map((v) => ({
    ...v,
    parentId: v.baseVersion, // Sync parentId with baseVersion
    children: [] as TemplateVersion[], // Initialize children
  }));

  const versionMap = new Map<string, TemplateVersion>();
  processed.forEach((v) => versionMap.set(v.id, v));

  processed.forEach((v) => {
    if (v.parentId && versionMap.has(v.parentId)) {
      versionMap.get(v.parentId)!.children!.push(v);
    }
  });

  return processed;
};

const TemplateDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string>("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

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
    const isNew = !templateId || templateId === "new";

    const fetchData = async () => {
      setLoading(true);
      if (!isNew && templateId) {
        try {
          const [basicInfo, versions] = await Promise.all([
            getTemplateDetail(templateId),
            getTemplateVersions(templateId),
          ]);

          // Map backend versions to frontend structure
          const mappedVersions = ((versions as any[]) || []).map((v: any) => ({
            ...v,
            date: v.createdAt,
            globalConfigs: [],
            modules: [],
            children: [],
          }));

          const templateData = {
            ...(basicInfo as any),
            versions: processVersions(mappedVersions),
          };
          setTemplate(templateData as any);

          // Find latest version or use stored latestVersion
          // backend basicInfo has latestVersion string (version number), but here we need ID.
          // We can find by version number if needed, or just take the last one in list (sorted by time)
          const latest =
            templateData.versions.length > 0
              ? templateData.versions[0] // Assuming backend sorts DESC, first is latest?
              : // Wait, backend listVersions sorts DESC (createdAt DESC).
                // So first element is latest.
                undefined;

          setCurrentVersionId(latest?.id || "");
        } catch (err) {
          console.error(err);
          message.error("Failed to load template");
        }
      } else {
        // Init new template
        setTemplate({
          id: "new",
          name: "New Template",
          latestVersion: "",
          isEnabled: true,
          versions: [], // Empty versions initially
          author: "",
          updateTime: "",
          updater: "",
          createdDate: "",
        });
        setCurrentVersionId("");
        setVersionModalVisible(true);
      }
      setLoading(false);
    };

    fetchData();
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

  const handleCreateVersion = async (values: VersionCreationValues) => {
    if (!template) return;

    if (template.versions.length === 0) {
      // Initial Version Creation (New Template)
      try {
        setLoading(true);
        const res: any = await createTemplate({
          name: values.templateName!,
          description: values.templateDescription,
          initialVersion: {
            version: values.version,
            description: values.description,
            versionType: values.versionType,
          },
        });
        message.success("Template created successfully");
        setVersionModalVisible(false);
        // Navigate to real ID. API returns { data: { id: ... } }
        const newId = res.data?.id || res.id;
        navigate(`/templates/${newId}`, { replace: true });
      } catch (err) {
        console.error(err);
        message.error("Failed to create template");
      } finally {
        setLoading(false);
      }
      return;
    }

    let newVer: TemplateVersion;
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
      parentId: parent.id,
      children: [],
      description: values.description,
      versionType: values.versionType,
    };

    const updatedVersions = processVersions([...template.versions, newVer]);

    setTemplate({
      ...template,
      versions: updatedVersions,
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
        const processedVersions = processVersions(newVersions);
        setTemplate({ ...template, versions: processedVersions });

        if (currentVersionId === versionId) {
          // Switch to another version, preferably previous one or last one
          setCurrentVersionId(
            processedVersions[processedVersions.length - 1].id
          );
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

  const handleStartEdit = () => {
    if (template) {
      setTempName(template.name);
      setEditingName(true);
    }
  };

  const handleSaveName = async () => {
    if (!template) return;
    if (tempName === template.name) {
      setEditingName(false);
      return;
    }

    if (template.id === "new") {
      setTemplate({ ...template, name: tempName });
      setEditingName(false);
      return;
    }

    try {
      await updateTemplate(template.id, { name: tempName });
      setTemplate({ ...template, name: tempName });
      message.success(t.templateDetail.updateSuccess);
      setEditingName(false);
    } catch (e) {
      console.error(e);
      message.error(t.templateDetail.updateFailed);
    }
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
          {editingName ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onPressEnter={handleSaveName}
              className={styles.titleInput}
              autoFocus
            />
          ) : (
            <div className={styles.titleText} onClick={handleStartEdit}>
              <Title level={4} style={{ margin: 0 }}>
                {template.id === "new" && template.name === "New Template"
                  ? t.templateDetail.newTitle
                  : template.name}
              </Title>
              <EditOutlined className={styles.editIcon} />
            </div>
          )}
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
        </Space>
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
          isParentTerminal={
            !currentVersion?.children?.some((c) => c.versionType !== "Branch")
          }
        />
      )}
    </div>
  );
};

export default TemplateDetailPage;
