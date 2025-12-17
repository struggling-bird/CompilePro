import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  PlusOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Card,
  Button,
  Tag,
  Tabs,
  Steps,
  Typography,
  Space,
  Alert,
  Row,
  Col,
} from "antd";
import { Project, VersionConfig } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import AddVersionModal from "../components/AddVersionModal";
import ConfigTable from "../components/ConfigTable";
import ConfigEditorDrawer from "../components/ConfigEditorDrawer";
import CmdList from "../components/CmdList";
import ArtifactList from "../components/ArtifactList";
import {
  getProjectDetail,
  getCloneStatus,
  retryClone,
  listConfigs,
  upsertConfig,
  deleteConfig,
  updateCommands,
  updateArtifacts,
} from "@/services/metaprojects";
import { message } from "antd";

const { Title, Text, Link } = Typography;

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [activeVersion, setActiveVersion] = useState<string>("");
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [cloneStatus, setCloneStatus] = useState<string>("idle");
  const [cloneMessage, setCloneMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [configs, setConfigs] = useState<VersionConfig[]>([]);
  const [configsLoading, setConfigsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<VersionConfig | undefined>(
    undefined
  );
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const res = await getProjectDetail(projectId);
        const versions = (res.versions ?? []).map((v) => ({
          id: v.id,
          version: v.version,
          date: v.createdAt,
          type: v.sourceType,
          isDeprecated: v.status === "disabled",
          ref: v.sourceValue,
          compileCommands: v.compileCommands || [],
          artifacts: v.artifacts || [],
        }));
        const latest = versions[0]?.version ?? "";
        const proj: Project = {
          id: res.id,
          name: res.name,
          latestVersion: latest,
          readmeUrl: "",
          buildDocUrl: "",
          versions,
          gitRepo: res.gitUrl,
          description: res.description ?? undefined,
        } as Project;
        if (mounted) {
          setProject(proj);
          setActiveVersion(latest);
        }
      } catch (err: any) {
        message.error(err?.message || "加载详情失败");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const startPolling = () => {
    if (!projectId) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const tick = async () => {
      try {
        const s = await getCloneStatus(projectId);
        setCloneStatus(s.status);
        setCloneMessage(s.message || "");
        if (
          (s.status === "error" || s.status === "success") &&
          pollRef.current
        ) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (err: any) {
        setCloneStatus("idle");
        setCloneMessage(err?.message || "");
      }
    };
    tick();
    pollRef.current = window.setInterval(tick, 3000);
  };

  useEffect(() => {
    startPolling();
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [projectId]);

  const currentVersionId = useMemo(() => {
    return project?.versions.find((v) => v.version === activeVersion)?.id;
  }, [project, activeVersion]);

  useEffect(() => {
    if (projectId && currentVersionId) {
      fetchConfigs();
    }
  }, [projectId, currentVersionId]);

  const fetchConfigs = async () => {
    if (!projectId || !currentVersionId) return;
    try {
      setConfigsLoading(true);
      const res = await listConfigs(projectId, currentVersionId);
      setConfigs(res.list);
    } catch (err: any) {
      message.error(err?.message || "加载配置失败");
    } finally {
      setConfigsLoading(false);
    }
  };

  const handleSaveConfig = async (values: any) => {
    if (!projectId || !currentVersionId) return;
    try {
      await upsertConfig(projectId, currentVersionId, values);
      message.success("保存成功");
      setShowConfigModal(false);
      setEditingConfig(undefined);
      fetchConfigs();
    } catch (err: any) {
      message.error(err?.message || "保存失败");
    }
  };

  const handleDeleteConfig = async (record: VersionConfig) => {
    if (!projectId || !currentVersionId) return;
    try {
      await deleteConfig(projectId, currentVersionId, record.id);
      message.success("删除成功");
      fetchConfigs();
    } catch (err: any) {
      message.error(err?.message || "删除失败");
    }
  };

  const handleUpdateCommands = async (newCommands: string[]) => {
    if (!currentVersionId || !project) return;
    try {
      await updateCommands(projectId!, currentVersionId, {
        commands: newCommands,
      });
      // Optimistically update local state
      const newVersions = project.versions.map((v) => {
        if (v.id === currentVersionId) {
          return { ...v, compileCommands: newCommands };
        }
        return v;
      });
      setProject({ ...project, versions: newVersions });
      message.success("命令已更新");
    } catch (e: any) {
      message.error(e?.message || "更新失败");
    }
  };

  const handleUpdateArtifacts = async (newArtifacts: string[]) => {
    if (!currentVersionId || !project) return;
    try {
      await updateArtifacts(projectId!, currentVersionId, {
        artifacts: newArtifacts,
      });
      // Optimistically update local state
      const newVersions = project.versions.map((v) => {
        if (v.id === currentVersionId) {
          return { ...v, artifacts: newArtifacts };
        }
        return v;
      });
      setProject({ ...project, versions: newVersions });
      message.success("制品配置已更新");
    } catch (e: any) {
      message.error(e?.message || "更新失败");
    }
  };

  if (!project) return <div style={{ padding: 24 }}>项目不存在或加载中...</div>;

  const handleAddVersion = (values: any) => {
    console.log("Adding version:", values);
    setShowAddVersionModal(false);
  };

  const stepsItems = project.versions.map((v) => ({
    title: v.version,
    description: (
      <Space orientation="vertical" size={0}>
        <Text
          type={v.isDeprecated ? "danger" : "secondary"}
          style={{ fontSize: 12 }}
        >
          {v.isDeprecated ? t.projectDetail.deprecated : v.date}
        </Text>
        {v.type === "branch" && (
          <Tag color="purple" style={{ marginRight: 0 }}>
            Branch
          </Tag>
        )}
      </Space>
    ),
    status:
      activeVersion === v.version
        ? "process"
        : ((v.isDeprecated ? "error" : "wait") as
            | "process"
            | "wait"
            | "finish"
            | "error"),
    icon: v.type === "branch" ? <BranchesOutlined /> : <TagOutlined />,
  }));

  // Find index for Steps current
  const currentStep = project.versions.findIndex(
    (v) => v.version === activeVersion
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          backgroundColor: "white",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/meta-projects")}
          >
            {t.projectDetail.back}
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {project.name}
          </Title>
          <Text type="secondary">|</Text>
          <Link href={project.gitRepo || "#"} target="_blank">
            <BranchesOutlined /> {project.gitRepo || "Git仓库"}
          </Link>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {/* Clone Status */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <div>
              <Text>克隆进度：</Text>
              <Tag
                color={
                  cloneStatus === "success"
                    ? "green"
                    : cloneStatus === "error"
                    ? "red"
                    : "blue"
                }
              >
                {cloneStatus}
              </Tag>
              {cloneMessage ? (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  {cloneMessage}
                </Text>
              ) : null}
            </div>
            <Button
              onClick={async () => {
                if (!projectId) return;
                try {
                  await retryClone(projectId);
                  message.success("已重新发起克隆");
                  setCloneStatus("running");
                  setCloneMessage("");
                  startPolling();
                } catch (err: any) {
                  message.error(err?.message || "重试失败");
                }
              }}
              disabled={cloneStatus === "running"}
            >
              重新尝试
            </Button>
          </Space>
        </Card>
        {/* Config List */}
        <Card
          title="配置列表"
          size="small"
          style={{ marginBottom: 24 }}
          extra={
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingConfig(undefined);
                setShowConfigModal(true);
              }}
            >
              添加配置项
            </Button>
          }
        >
          <ConfigTable
            loading={configsLoading}
            dataSource={configs}
            onEdit={(record) => {
              setEditingConfig(record);
              setShowConfigModal(true);
            }}
            onDelete={handleDeleteConfig}
          />
        </Card>

        {/* Build Commands & Version History */}
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card
              title={t.projectDetail.compilationCommands}
              size="small"
              loading={loading}
              style={{ marginBottom: 16 }}
            >
              <CmdList
                commands={
                  project.versions.find((v) => v.version === activeVersion)
                    ?.compileCommands || []
                }
                onUpdate={handleUpdateCommands}
                loading={loading}
              />
            </Card>
            <Card title="制品目录配置" size="small" loading={loading}>
              <ArtifactList
                artifacts={
                  project.versions.find((v) => v.version === activeVersion)
                    ?.artifacts || []
                }
                onUpdate={handleUpdateArtifacts}
                loading={loading}
              />
            </Card>
          </Col>
          <Col span={16}>
            <Card
              title={t.projectDetail.versionHistory}
              style={{ height: "100%" }}
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddVersionModal(true)}
                >
                  {t.projectDetail.new}
                </Button>
              }
            >
              <div style={{ overflowX: "auto", paddingBottom: 16 }}>
                <Steps
                  current={currentStep}
                  onChange={(current) =>
                    setActiveVersion(project.versions[current].version)
                  }
                  items={stepsItems}
                  titlePlacement="vertical"
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Docs */}
        <Card style={{ marginTop: 24 }} styles={{ body: { padding: 0 } }}>
          <Tabs
            tabPlacement="top"
            size="large"
            tabBarStyle={{ paddingLeft: 16, marginBottom: 0 }}
            items={[
              {
                key: "README",
                label: t.projectDetail.readme,
                children: (
                  <div style={{ padding: 24 }}>
                    <Title level={3}>{t.projectDetail.docsTitle}</Title>
                    <Text>{t.projectDetail.docsDesc1}</Text>
                    <br />
                    <Text>{t.projectDetail.docsDesc2}</Text>
                    <Alert
                      title="Current Context"
                      description={
                        <Text type="secondary" code>
                          {activeVersion}{" "}
                          {project.versions.find(
                            (v) => v.version === activeVersion
                          )?.type === "branch"
                            ? "(Branch)"
                            : ""}
                        </Text>
                      }
                      type="info"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
                  </div>
                ),
              },
              {
                key: "BUILD",
                label: t.projectDetail.build,
                children: <div style={{ padding: 24 }}>Build Doc...</div>,
              },
              {
                key: "UPDATE",
                label: t.projectDetail.update,
                children: <div style={{ padding: 24 }}>Changelog...</div>,
              },
            ]}
          />
        </Card>
      </div>

      <AddVersionModal
        visible={showAddVersionModal}
        project={project}
        onCancel={() => setShowAddVersionModal(false)}
        onAdd={handleAddVersion}
      />

      <ConfigEditorDrawer
        visible={showConfigModal}
        projectId={projectId || ""}
        config={editingConfig}
        onClose={() => {
          setShowConfigModal(false);
          setEditingConfig(undefined);
        }}
        onSave={handleSaveConfig}
      />
    </div>
  );
};

export default ProjectDetail;
