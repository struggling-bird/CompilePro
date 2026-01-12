import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Select,
  Button,
  Card,
  message,
  Checkbox,
  Input,
  List,
  Tag,
  Progress,
  Typography,
  Space,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  EnvironmentOutlined,
  ProjectOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  listCompilations,
  getCompilation,
} from "../../../services/compilations";
import {
  listCustomers,
  getCustomerEnvironments,
} from "../../../services/customers";
import { listModules } from "../../../services/templates";
import { createBuild, simulateBuildProcess } from "../../../services/builds";
import {
  Compilation,
  Customer,
  Environment,
  TemplateModule,
  BuildExecution,
  ModuleBuildStatus,
} from "../../../types";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

const BuildWizard: React.FC = () => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  // Data Sources
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [compilations, setCompilations] = useState<Compilation[]>([]);
  const [modules, setModules] = useState<TemplateModule[]>([]);

  // Selected State
  const [selectedCompilation, setSelectedCompilation] = useState<Compilation>();
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);

  // Build State
  const [buildId, setBuildId] = useState<string>();
  const [buildState, setBuildState] = useState<BuildExecution>();
  const [isBuilding, setIsBuilding] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [logFilter, setLogFilter] = useState<"ALL" | "INFO" | "WARN" | "ERROR">(
    "ALL"
  );

  // Initial Data Load
  useEffect(() => {
    const init = async () => {
      try {
        const custs = await listCustomers();
        setCustomers(custs);
      } catch (e) {
        message.error(t.builds.loadCustomersFailed);
      }
    };
    init();
  }, []);

  // Handlers
  const handleCustomerChange = async (custId: string) => {
    form.setFieldsValue({ environmentId: undefined, compilationId: undefined });
    setEnvironments([]);
    setCompilations([]);
    setSelectedCompilation(undefined);
    setModules([]);
    try {
      const res = await getCustomerEnvironments(custId);
      setEnvironments((res as any).list || []);
    } catch (e) {
      message.error(t.builds.loadEnvsFailed);
    }
  };

  const handleEnvironmentChange = async (envId: string) => {
    form.setFieldsValue({ compilationId: undefined });
    setCompilations([]);
    setSelectedCompilation(undefined);
    setModules([]);
    try {
      const res = await listCompilations({ pageSize: 100 });
      const allCompilations = res.items;
      // Filter by customer and env
      const custId = form.getFieldValue("customerId");
      const filtered = allCompilations.filter(
        (c) => c.customerId === custId && c.environmentId === envId
      );
      setCompilations(filtered);
    } catch (e) {
      message.error(t.builds.loadCompsFailed);
    }
  };

  const handleCompilationChange = async (compId: string) => {
    try {
      const comp = await getCompilation(compId);
      setSelectedCompilation(comp);
      if (comp.templateVersion) {
        const mods = await listModules(comp.templateVersion);
        setModules((mods as any).data || mods || []);
      }
    } catch (e) {
      message.error(t.builds.loadCompDetailFailed);
    }
  };

  // Build Execution
  const handleStartBuild = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedCompilation) return;
      if (selectedModuleIds.length === 0) {
        message.error(t.builds.selectModuleRequired);
        return;
      }

      const moduleStatus: ModuleBuildStatus[] = modules
        .filter((m) => selectedModuleIds.includes(m.id))
        .map((m) => ({
          moduleId: m.id,
          moduleName: m.projectName,
          status: "Pending",
          progress: 0,
        }));

      const payload: Partial<BuildExecution> = {
        compilationId: selectedCompilation.id,
        description: values.description,
        selectedModuleIds,
        moduleStatus,
        snapshot: {
          customerName: selectedCompilation.customerName || "",
          environmentName: selectedCompilation.environmentName || "",
          templateName: selectedCompilation.templateName || "",
          templateVersion: selectedCompilation.templateVersion || "",
          compilationName: selectedCompilation.name,
          globalConfigs: selectedCompilation.globalConfigs,
          moduleConfigs: selectedCompilation.moduleConfigs,
        },
      };

      const newBuildId = await createBuild(payload);
      setBuildId(newBuildId);
      setIsBuilding(true);

      // Start Simulation
      simulateBuildProcess(newBuildId, (updatedBuild) => {
        setBuildState(updatedBuild);
        if (
          updatedBuild.status === "Success" ||
          updatedBuild.status === "Failed"
        ) {
          setIsBuilding(false);
        }
      });
    } catch (e) {
      message.error(t.builds.startBuildFailed);
    }
  };

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [buildState?.logs]);

  // Panels
  const renderConfigPanel = () => (
    <Card
      title={t.builds.configTitle}
      bordered={false}
      style={{ height: "100%", overflowY: "auto" }}
      extra={isBuilding && <Tag color="blue">{t.builds.building}</Tag>}
    >
      <Form form={form} layout="vertical" disabled={isBuilding || !!buildId} autoComplete="off">
        <Form.Item
          name="customerId"
          label={t.builds.customer}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={t.builds.selectCustomer}
            onChange={handleCustomerChange}
            suffixIcon={<UserOutlined />}
          >
            {customers.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="environmentId"
          label={t.builds.environment}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={t.builds.selectEnvironment}
            onChange={handleEnvironmentChange}
            disabled={!form.getFieldValue("customerId")}
            suffixIcon={<EnvironmentOutlined />}
          >
            {environments.map((e) => (
              <Option key={e.id} value={e.id}>
                {e.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="compilationId"
          label={t.builds.compilation}
          rules={[{ required: true }]}
        >
          <Select
            placeholder={t.builds.selectCompilation}
            onChange={handleCompilationChange}
            disabled={!form.getFieldValue("environmentId")}
            suffixIcon={<ProjectOutlined />}
          >
            {compilations.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label={t.builds.desc}
          rules={[
            { required: true, message: t.builds.descRequired },
            { min: 20, message: t.builds.descMin },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t.builds.descPlaceholder}
          />
        </Form.Item>

        {!buildId && (
          <Button
            type="primary"
            block
            size="large"
            icon={<PlayCircleOutlined />}
            onClick={handleStartBuild}
            disabled={!selectedCompilation}
          >
            {t.builds.startBuild}
          </Button>
        )}
      </Form>
    </Card>
  );

  const renderModuleSelectionPanel = () => (
    <Card
      title={
        <Space>
          <span>{t.builds.targetModules}</span>
          <Tag>{modules.length} {t.builds.available}</Tag>
        </Space>
      }
      bordered={false}
      style={{ height: "100%", overflowY: "auto" }}
      extra={
        <Space>
          <Button
            size="small"
            type="link"
            onClick={() => setSelectedModuleIds(modules.map((m) => m.id))}
          >
            {t.builds.selectAll}
          </Button>
          <Button
            size="small"
            type="link"
            onClick={() => setSelectedModuleIds([])}
          >
            {t.builds.clear}
          </Button>
        </Space>
      }
    >
      {!selectedCompilation ? (
        <div style={{ textAlign: "center", color: "#999", padding: 40 }}>
          <InfoCircleOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <div>{t.builds.selectCompFirst}</div>
        </div>
      ) : (
        <Checkbox.Group
          style={{ width: "100%" }}
          value={selectedModuleIds}
          onChange={(vals) => setSelectedModuleIds(vals as string[])}
        >
          <List
            grid={{ gutter: 16, column: 2, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
            dataSource={modules}
            renderItem={(item) => (
              <List.Item>
                <Card size="small" hoverable className="module-card">
                  <Checkbox value={item.id} style={{ width: "100%" }}>
                    <Text strong>{item.projectName}</Text>
                    <div
                      style={{ color: "#888", fontSize: "12px", marginTop: 4 }}
                    >
                      {item.description || t.builds.noDesc}
                    </div>
                  </Checkbox>
                </Card>
              </List.Item>
            )}
          />
        </Checkbox.Group>
      )}
    </Card>
  );

  const renderMonitorPanel = () => {
    const totalProgress = buildState
      ? Math.round(
          (buildState.moduleStatus.reduce((acc, m) => acc + m.progress, 0) /
            (buildState.moduleStatus.length * 100)) *
            100
        )
      : 0;

    const filteredLogs = (buildState?.logs || []).filter((l) =>
      logFilter === "ALL" ? true : l.level === logFilter
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Top: Progress Summary */}
        <Card
          bordered={false}
          bodyStyle={{ padding: "16px 24px" }}
          style={{ marginBottom: 16 }}
        >
          <Row align="middle" gutter={24}>
            <Col flex="auto">
              <Progress
                percent={totalProgress}
                status={
                  buildState?.status === "Failed" ? "exception" : "active"
                }
                strokeWidth={12}
              />
            </Col>
            <Col>
              <Space>
                {buildState?.status === "Success" && buildState.artifactUrl && (
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    href={buildState.artifactUrl}
                    target="_blank"
                  >
                    {t.builds.downloadArtifact}
                  </Button>
                )}
                <Tag
                  color={
                    buildState?.status === "Running"
                      ? "processing"
                      : buildState?.status === "Success"
                      ? "success"
                      : "error"
                  }
                  style={{ fontSize: 14, padding: "4px 10px" }}
                >
                  {buildState?.status.toUpperCase()}
                </Tag>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={16} style={{ flex: 1, minHeight: 0 }}>
          {/* Left: Module Status List */}
          <Col span={8} style={{ height: "100%", overflowY: "auto" }}>
            <Card
              title={t.builds.moduleStatus}
              bordered={false}
              bodyStyle={{ padding: 12 }}
            >
              <List
                dataSource={buildState?.moduleStatus || []}
                renderItem={(item) => (
                  <Card
                    size="small"
                    style={{
                      marginBottom: 8,
                      borderColor:
                        item.status === "Failed"
                          ? "#ff4d4f"
                          : item.status === "Success"
                          ? "#52c41a"
                          : undefined,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text strong>{item.moduleName}</Text>
                      <Tag
                        color={
                          item.status === "Success"
                            ? "success"
                            : item.status === "Failed"
                            ? "error"
                            : "default"
                        }
                      >
                        {item.status}
                      </Tag>
                    </div>
                    <Progress
                      percent={item.progress}
                      size="small"
                      status={item.status === "Failed" ? "exception" : "active"}
                      showInfo={false}
                    />
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {item.errorMessage ? (
                        <Text type="danger" style={{ fontSize: 12 }}>
                          {item.errorMessage}
                        </Text>
                      ) : (
                        <span />
                      )}
                      {item.status === "Success" && item.artifactUrl && (
                        <Tooltip title={t.builds.downloadModuleArtifact}>
                          <Button
                            type="link"
                            size="small"
                            icon={<DownloadOutlined />}
                            href={item.artifactUrl}
                            target="_blank"
                            style={{ padding: 0, height: 20 }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </Card>
                )}
              />
            </Card>
          </Col>

          {/* Right: Logs */}
          <Col span={16} style={{ height: "100%" }}>
            <Card
              title={t.builds.buildLogs}
              bordered={false}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              bodyStyle={{
                flex: 1,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
              extra={
                <Space size="small">
                  {(["ALL", "INFO", "WARN", "ERROR"] as const).map((lvl) => (
                    <Button
                      key={lvl}
                      size="small"
                      type={logFilter === lvl ? "primary" : "default"}
                      onClick={() => setLogFilter(lvl)}
                      danger={lvl === "ERROR"}
                    >
                      {lvl}
                    </Button>
                  ))}
                </Space>
              }
            >
              <div
                ref={logContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: 16,
                  backgroundColor: "#1e1e1e",
                  color: "#d4d4d4",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              >
                {filteredLogs.map((log) => (
                  <div key={log.id} style={{ marginBottom: 4 }}>
                    <span style={{ color: "#569cd6", marginRight: 8 }}>
                      [{log.timestamp.split("T")[1].split(".")[0]}]
                    </span>
                    <span
                      style={{
                        color:
                          log.level === "ERROR"
                            ? "#f44336"
                            : log.level === "WARN"
                            ? "#ff9800"
                            : "#4caf50",
                        fontWeight: "bold",
                        marginRight: 8,
                      }}
                    >
                      [{log.level}]
                    </span>
                    <span>{log.message}</span>
                    {log.context && (
                      <pre
                        style={{
                          color: "#f44336",
                          margin: "4px 0 0 20px",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {log.context}
                      </pre>
                    )}
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div style={{ color: "#666", fontStyle: "italic" }}>
                    {t.builds.noLogs}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: 24,
        height: "100%",
        backgroundColor: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Title level={4} style={{ marginBottom: 24 }}>
        {t.builds.title}
      </Title>
      <Row gutter={24} style={{ flex: 1, minHeight: 0 }}>
        {/* Left Config Panel */}
        <Col span={6} style={{ height: "100%" }}>
          {renderConfigPanel()}
        </Col>

        {/* Right Content Panel */}
        <Col span={18} style={{ height: "100%" }}>
          {buildId ? renderMonitorPanel() : renderModuleSelectionPanel()}
        </Col>
      </Row>
    </div>
  );
};

export default BuildWizard;
