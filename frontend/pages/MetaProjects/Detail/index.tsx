import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  PlusOutlined,
  CloseOutlined,
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
  Row,
  Col,
  Alert,
} from "antd";
import { MOCK_PROJECTS } from "@/constants";
import { Project } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import AddVersionModal from "../components/AddVersionModal";
import FileEditorDrawer from "../components/FileEditorDrawer";

const { Title, Text, Link } = Typography;

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const project = MOCK_PROJECTS.find((p) => p.id === projectId) as Project;

  const [activeVersion, setActiveVersion] = useState(project?.latestVersion);
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  if (!project) return <div>Project not found</div>;

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
            onClick={() => navigate("/projects")}
          >
            {t.projectDetail.back}
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {project.name}
          </Title>
          <Text type="secondary">|</Text>
          <Link href="#" target="_blank">
            <BranchesOutlined /> http://git.zhugeio.com/frontend/webapp
          </Link>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {/* Config & Build */}
        <Row gutter={24}>
          <Col span={8}>
            <Card title={t.projectDetail.compilationCommands} size="small">
              <Space orientation="vertical" style={{ width: "100%" }}>
                {["yarn", "npm run build"].map((cmd, idx) => (
                  <Alert
                    key={idx}
                    title={cmd}
                    type="info"
                    closable={{ closeIcon: <CloseOutlined /> }}
                  />
                ))}
                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => setShowEditor(true)}
                >
                  {t.projectDetail.newCmd}
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={16}>
            <Card
              title={t.projectDetail.configTypesTitle}
              size="small"
              style={{ backgroundColor: "#fffbf0", borderColor: "#fcefc7" }}
            >
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>
                  <Text strong>1.</Text> {t.projectDetail.configTypes.text}
                </li>
                <li>
                  <Text strong>2.</Text> {t.projectDetail.configTypes.file}
                </li>
                <li>
                  <Text strong>3.</Text> {t.projectDetail.configTypes.json}
                </li>
              </ul>
            </Card>
          </Col>
        </Row>

        {/* Timeline */}
        <Card
          title={t.projectDetail.versionHistory}
          style={{ marginTop: 24 }}
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

      <FileEditorDrawer
        visible={showEditor}
        onClose={() => setShowEditor(false)}
      />
    </div>
  );
};

export default ProjectDetail;
