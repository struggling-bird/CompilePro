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
import {
  ProjectTemplate,
  TemplateVersion,
  TemplateGlobalConfig,
  TemplateModuleConfig,
} from "../../../types";
import VersionTimeline from "./components/VersionTimeline";
import GlobalConfigTable from "../../../components/GlobalConfigTable";
import ModuleTabs from "../../../components/ModuleTabs";
import ConfigForm from "./components/ConfigForm";
import VersionCreationModal, {
  VersionCreationValues,
} from "./components/VersionCreationModal";
import AddModuleModal from "./components/AddModuleModal";
import SwitchModuleVersionModal from "./components/SwitchModuleVersionModal";
import ConfigEditorDrawer from "../../MetaProjects/components/ConfigEditorDrawer";
import styles from "../styles/Detail.module.less";
import dayjs from "dayjs";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  createTemplate,
  getTemplateDetail,
  getTemplateVersions,
  updateTemplate,
  addGlobalConfig,
  getGlobalConfigs,
  deleteGlobalConfig,
  addModule,
  listModules,
  updateModuleConfig,
} from "../../../services/templates";
import { listConfigs } from "../../../services/metaprojects";

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

  // Add Module Modal
  const [addModuleModalVisible, setAddModuleModalVisible] = useState(false);
  // Module Config Drawer
  const [moduleDrawerVisible, setModuleDrawerVisible] = useState(false);
  // Switch Module Version Modal
  const [switchModalVisible, setSwitchModalVisible] = useState(false);
  const [switchTargetModuleId, setSwitchTargetModuleId] = useState<
    string | undefined
  >(undefined);

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
          message.error(t.templateDetail.loadFailed);
        }
      } else {
        // Init new template
        setTemplate({
          id: "new",
          name: t.templateDetail.newTemplate,
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

  useEffect(() => {
    const fetchData = async () => {
      if (currentVersionId && template) {
        try {
          const [globalConfigsRes, modulesRes] = await Promise.all([
            getGlobalConfigs(currentVersionId),
            listModules(currentVersionId),
          ]);
          const globalConfigs =
            (globalConfigsRes as any).data || globalConfigsRes;
          const modules = (modulesRes as any).data || modulesRes;

          // Ensure configs property exists and map if necessary
          const mappedModules = (modules || []).map((m: any) => ({
            ...m,
            configs: m.configs || [],
          }));

          setTemplate((prev) => {
            if (!prev) return null;
            const newVersions = prev.versions.map((v) =>
              v.id === currentVersionId
                ? { ...v, globalConfigs, modules: mappedModules }
                : v
            );
            return { ...prev, versions: newVersions };
          });
        } catch (e) {
          console.error("Failed to fetch version details", e);
        }
      }
    };
    fetchData();
  }, [currentVersionId]);

  const currentVersion = useMemo(() => {
    return template?.versions.find((v) => v.id === currentVersionId);
  }, [template, currentVersionId]);

  const usageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!currentVersion) return counts;

    currentVersion.modules.forEach((mod) => {
      (mod.configs || []).forEach((cfg) => {
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
        message.success(
          t.templateDetail.merged
            .replace("{{source}}", source.version)
            .replace("{{target}}", target.version)
        );
        // Logic to update target version with changes...
      } else {
        message.warning(t.templateDetail.baseNotFound);
      }
    } else {
      message.warning(t.templateDetail.noBase);
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
        message.success(t.templateDetail.createSuccess);
        setVersionModalVisible(false);
        // Navigate to real ID. API returns { data: { id: ... } }
        const newId = res.data?.id || res.id;
        navigate(`/templates/${newId}`, { replace: true });
      } catch (err) {
        console.error(err);
        message.error(t.templateDetail.createFailed);
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
    message.success(t.templateDetail.newVersionSuccess);
    setVersionModalVisible(false);
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!template) return;
    // Prevent deleting the last remaining version
    if (template.versions.length <= 1) {
      message.warning(t.templateDetail.deleteLastVersion);
      return;
    }

    Modal.confirm({
      title: t.templateDetail.deleteVersionTitle,
      content: t.templateDetail.deleteVersionConfirm,
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
        message.success(t.templateDetail.versionDeleted);
      },
    });
  };

  const handleGlobalConfig = (
    action: "ADD" | "EDIT" | "DELETE",
    config?: TemplateGlobalConfig
  ) => {
    if (!currentVersion || !template) return;

    if (action === "DELETE" && config) {
      Modal.confirm({
        title: t.templateDetail.confirmDelete,
        content: t.templateDetail.deleteGlobalConfirm,
        onOk: async () => {
          try {
            await deleteGlobalConfig(config.id);
            const updatedGlobal = currentVersion.globalConfigs.filter(
              (c) => c.id !== config.id
            );
            updateCurrentVersion({
              ...currentVersion,
              globalConfigs: updatedGlobal,
            });
            message.success(t.templateDetail.globalDeleted);
          } catch (e) {
            console.error(e);
            message.error(t.templateDetail.deleteGlobalFailed);
          }
        },
      });
    } else {
      setModalMode("GLOBAL");
      setEditingConfig(config);
      setModalVisible(true);
    }
  };

  const handleModuleConfig = (
    moduleId: string,
    action: "EDIT" | "DELETE",
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
    } else if (action === "EDIT") {
      setActiveModuleId(moduleId);
      setEditingConfig(config);
      setModuleDrawerVisible(true);
    }
  };

  const handleModuleDrawerSave = async (values: any) => {
    if (!currentVersion || !activeModuleId) return;

    try {
      let mappingValue = "";
      if (values.mappingType === "GLOBAL") {
        mappingValue = values.mappingValue;
      } else if (values.type === "TEXT") {
        mappingValue = values.textTarget || "";
      } else if (values.type === "FILE") {
        if (values.uploadedTargetFile) {
          const formData = new FormData();
          formData.append("files", values.uploadedTargetFile);
          const token = localStorage.getItem("token");
          const res = await fetch("/apis/storage/upload?isTemp=true", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
          const data = await res.json();
          // Support multiple response formats
          let fileId = "";
          if (Array.isArray(data)) {
            fileId = data[0]?.id;
          } else if (data.data && Array.isArray(data.data)) {
            fileId = data.data[0]?.id;
          } else if (data.id) {
            fileId = data.id;
          }
          mappingValue = fileId;
        } else {
          // If no new file uploaded, keep existing mappingValue
          // Check if editingConfig is TemplateModuleConfig
          mappingValue =
            (editingConfig as TemplateModuleConfig)?.mappingValue || "";
        }
      }

      if (editingConfig?.id && !editingConfig.id.startsWith("c")) {
        await updateModuleConfig(editingConfig.id, {
          name: values.name,
          description: values.description,
          fileLocation: values.fileOriginPath,
          regex: values.textOrigin || "",
          mappingType: values.mappingType || "MANUAL",
          mappingValue: mappingValue,
          isHidden: false,
        });
      }

      const newConfig: TemplateModuleConfig = {
        id: editingConfig?.id || `c${Date.now()}`,
        name: values.name,
        description: values.description,
        fileLocation: values.fileOriginPath,
        regex: values.textOrigin || "",
        mappingType: values.mappingType || "MANUAL",
        mappingValue: mappingValue,
        isHidden: false,
        isSelected: true,
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
      setModuleDrawerVisible(false);
      message.success(t.templateDetail.moduleSaved);
    } catch (e) {
      console.error(e);
      message.error(t.templateDetail.saveModuleFailed);
    }
  };

  const handleSaveModal = async (values: any) => {
    if (!currentVersion) return;

    if (modalMode === "GLOBAL") {
      try {
        if (editingConfig?.id) {
          // Update Logic (Pending implementation for Update API)
          // ... update logic
        } else {
          // Add Logic
          const res: any = await addGlobalConfig(currentVersion.id, {
            name: values.name,
            type: values.type,
            defaultValue: values.defaultValue,
            description: values.description,
            isHidden: values.isHidden,
          });

          const newConfig = res.data || res;
          const newGlobalConfigs = [newConfig, ...currentVersion.globalConfigs];

          updateCurrentVersion({
            ...currentVersion,
            globalConfigs: newGlobalConfigs,
          });
          message.success(t.templateDetail.globalAdded);
        }
      } catch (e) {
        console.error(e);
        message.error(t.templateDetail.saveGlobalFailed);
      }
    } else {
      if (!activeModuleId) return;
      // ... existing module logic ...
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
    setAddModuleModalVisible(true);
  };

  const inheritConfigsFromMeta = (
    rawConfigs: any[]
  ): TemplateModuleConfig[] => {
    return (rawConfigs || []).map((cfg: any) => ({
      id: cfg.id || `c${Date.now()}`,
      name: cfg.name || "",
      fileLocation: cfg.fileOriginPath || "",
      mappingType: "MANUAL",
      mappingValue: "",
      regex: cfg.textOrigin || "",
      description: cfg.description || "",
      isHidden: false,
      isSelected: true,
    }));
  };

  const handleConfirmAddModule = async (payload: {
    projectId: string;
    projectName: string;
    versionId: string;
    versionName: string;
  }) => {
    if (!currentVersion) return;
    try {
      const res: any = await addModule(currentVersion.id, {
        projectId: payload.projectId,
        // projectName: payload.projectName,
        projectVersion: payload.versionName,
        publishMethod: "GIT",
      });

      // The backend adds the module and syncs configs, returning the saved module.
      // We assume res or res.data is the module object.
      const newModule = res.data || res;

      // If newModule doesn't have configs populated in response (though it should),
      // we might need to fetch them or rely on what backend returns.
      // Assuming backend returns { ...module, configs: [...] }
      const moduleWithConfigs = { ...newModule, configs: newModule.configs || [] };

      updateCurrentVersion({
        ...currentVersion,
        modules: [...currentVersion.modules, moduleWithConfigs],
      });
      message.success(
        t.templateDetail.add + " " + t.templateDetail.moduleConfigTitle
      );
    } catch (e) {
      console.error(e);
      message.error(t.templateDetail.addModuleFailed);
    } finally {
      setAddModuleModalVisible(false);
    }
  };

  const handleSwitchVersionOpen = (moduleId: string) => {
    setSwitchTargetModuleId(moduleId);
    setSwitchModalVisible(true);
  };

  const handleSwitchVersionConfirm = async (payload: {
    versionId: string;
    versionName: string;
  }) => {
    if (!currentVersion || !switchTargetModuleId) return;
    try {
      const targetModule = currentVersion.modules.find(
        (m) => m.id === switchTargetModuleId
      );
      if (!targetModule) return;
      const configsResp: any = await listConfigs(
        targetModule.projectId,
        payload.versionId
      );
      const configs = configsResp.list || configsResp.data || configsResp || [];
      const moduleConfigs = inheritConfigsFromMeta(configs);

      const updatedModules = currentVersion.modules.map((m) =>
        m.id === switchTargetModuleId
          ? {
              ...m,
              projectVersion: payload.versionName,
              configs: moduleConfigs,
            }
          : m
      );
      updateCurrentVersion({ ...currentVersion, modules: updatedModules });
      message.success(t.templateDetail.versionUpdated);
    } catch (e) {
      console.error(e);
      message.error(t.templateDetail.switchVersionFailed);
    } finally {
      setSwitchModalVisible(false);
      setSwitchTargetModuleId(undefined);
    }
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
    return <div>{t.templateDetail.versionNotFound}</div>;

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
        title={t.templateDetail.versionGraph}
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
                    ? `${v.description || ""}\n[${
                        t.templateDetail.deprecatedReason
                      }]: ${reason}`
                    : v.description,
                };
              }
              return v;
            });
            setTemplate({ ...template, versions: newVersions });
            message.success(
              t.templateDetail.versionStatus.replace(
                "{{status}}",
                status === "Deprecated"
                  ? t.templateDetail.disabled
                  : t.templateDetail.enabled
              )
            );
          }}
        />
      </Drawer>

      {currentVersion && (
        <>
          <div className={styles.section}>
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
                onEditConfig={(mid, c) => handleModuleConfig(mid, "EDIT", c)}
                onDeleteConfig={(mid, cid) =>
                  handleModuleConfig(mid, "DELETE", { id: cid } as any)
                }
                onSwitchVersion={handleSwitchVersionOpen}
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
          <ConfigEditorDrawer
            visible={moduleDrawerVisible}
            projectId={
              currentVersion.modules.find((m) => m.id === activeModuleId)
                ?.projectId || ""
            }
            config={
              editingConfig
                ? {
                    id: editingConfig.id,
                    name: editingConfig.name,
                    type: (editingConfig as TemplateModuleConfig).regex
                      ? "TEXT"
                      : "FILE",
                    textOrigin: (editingConfig as TemplateModuleConfig).regex,
                    fileOriginPath: (editingConfig as TemplateModuleConfig)
                      .fileLocation,
                    description: editingConfig.description,
                    textTarget: (editingConfig as TemplateModuleConfig)
                      .mappingValue,
                    mappingType: (editingConfig as TemplateModuleConfig)
                      .mappingType,
                    mappingValue: (editingConfig as TemplateModuleConfig)
                      .mappingValue,
                  }
                : undefined
            }
            onClose={() => setModuleDrawerVisible(false)}
            onSave={handleModuleDrawerSave}
            enableTargetEdit={true}
            globalConfigs={currentVersion.globalConfigs}
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

      <AddModuleModal
        visible={addModuleModalVisible}
        onCancel={() => setAddModuleModalVisible(false)}
        onAdd={handleConfirmAddModule}
      />

      {switchTargetModuleId && (
        <SwitchModuleVersionModal
          visible={switchModalVisible}
          projectId={
            currentVersion?.modules.find((m) => m.id === switchTargetModuleId)
              ?.projectId || ""
          }
          currentVersionName={
            currentVersion?.modules.find((m) => m.id === switchTargetModuleId)
              ?.projectVersion || ""
          }
          onCancel={() => {
            setSwitchModalVisible(false);
            setSwitchTargetModuleId(undefined);
          }}
          onSwitch={handleSwitchVersionConfirm}
        />
      )}
    </div>
  );
};

export default TemplateDetailPage;
