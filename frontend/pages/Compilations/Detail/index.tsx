import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Space,
  Typography,
  Card,
  Row,
  Col,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  getCompilation,
  createCompilation,
  updateCompilation,
} from "../../../services/compilations";
import {
  getTemplatesList,
  getTemplate,
  getTemplateVersions,
  getGlobalConfigs,
  listModules,
} from "../../../services/templates";
import {
  listCustomers,
  getCustomerEnvironments,
} from "../../../services/customers";
import {
  Compilation,
  TemplateVersion,
  Customer,
  Environment,
} from "../../../types";
import { TemplateListItem } from "../../../services/templates";
import styles from "../styles/Detail.module.less";
import GlobalConfigValueTable from "./components/GlobalConfigValueTable";
import ModuleConfigValueTabs from "./components/ModuleConfigValueTabs";

const { Option } = Select;
const { Title } = Typography;
const { TextArea } = Input;

const CompilationDetail: React.FC = () => {
  const { compilationId } = useParams<{ compilationId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const isEdit = !!compilationId;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data Sources
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);

  // Selected State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [selectedVersionId, setSelectedVersionId] = useState<string>();
  const [templateDetail, setTemplateDetail] = useState<any>();
  const [selectedTemplateVersion, setSelectedTemplateVersion] =
    useState<TemplateVersion>();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>();

  // Config Values
  const [globalConfigs, setGlobalConfigs] = useState<
    { configId: string; value: string }[]
  >([]);
  const [moduleConfigs, setModuleConfigs] = useState<
    { moduleId: string; configId: string; value: string }[]
  >([]);

  // Initial Fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [tplRes, custRes] = await Promise.all([
          getTemplatesList({ pageSize: 100 }),
          listCustomers(),
        ]);
        setTemplates(tplRes.items || []);
        setCustomers(custRes);

        if (isEdit && compilationId) {
          const data = await getCompilation(compilationId);
          form.setFieldsValue({
            name: data.name,
            templateId: data.templateId,
            templateVersion: data.templateVersion,
            customerId: data.customerId,
            environmentId: data.environmentId,
            description: data.description,
          });
          setSelectedTemplateId(data.templateId);
          setSelectedVersionId(data.templateVersion);
          setGlobalConfigs(data.globalConfigs);
          setModuleConfigs(data.moduleConfigs);

          // We need to wait for template versions and environments
          // handleTemplateChange and handleCustomerChange will do fetching
          await handleTemplateChange(data.templateId, false);
          await handleCustomerChange(data.customerId, false);

          // Force set version object after fetching versions
          // Note: handleTemplateChange does this partially but we might need to ensure correct version object
        }
      } catch (e) {
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compilationId]);

  // Helper to fetch details
  const fetchVersionDetails = async (versionId: string) => {
    try {
      const [globalConfigsRes, modulesRes] = await Promise.all([
        getGlobalConfigs(versionId),
        listModules(versionId),
      ]);
      const globalConfigs =
        (globalConfigsRes as any).data || globalConfigsRes || [];
      const modules = (modulesRes as any).data || modulesRes || [];
      return { globalConfigs, modules };
    } catch (e) {
      console.error(e);
      return { globalConfigs: [], modules: [] };
    }
  };

  // Handle Template Change
  const handleTemplateChange = async (tplId: string, resetVersion = true) => {
    setSelectedTemplateId(tplId);
    if (resetVersion) {
      form.setFieldsValue({ templateVersion: undefined });
      setSelectedVersionId(undefined);
      setSelectedTemplateVersion(undefined);
      setTemplateDetail(undefined);
      setVersions([]);
    }

    try {
      const [detail, versionsRes] = await Promise.all([
        getTemplate(tplId),
        getTemplateVersions(tplId),
      ]);
      setTemplateDetail(detail);
      const vList = (versionsRes as any).data || versionsRes || [];
      setVersions(vList);

      if (!resetVersion && selectedVersionId) {
        // If we are editing, we try to find the version in the just fetched list
        // Note: selectedVersionId state might be stale if called from init(), so use form value or arg?
        // Actually init() sets state before calling this.
        // Wait, state updates are async. In init(), we await this function.
        // So we should pass the ID explicitly or rely on form value if state isn't ready.
        const targetId =
          selectedVersionId || form.getFieldValue("templateVersion");
        const v = vList.find(
          (item: any) => item.id === targetId || item.version === targetId
        );
        if (v) {
          const { globalConfigs, modules } = await fetchVersionDetails(v.id);
          setSelectedTemplateVersion({ ...v, globalConfigs, modules });
        }
      }
    } catch (e) {
      console.error(e);
      message.error("Failed to load template versions");
    }
  };

  // Handle Version Change
  const handleVersionChange = async (verId: string) => {
    setSelectedVersionId(verId);
    const v = versions.find((v: any) => v.id === verId);
    if (v) {
      const { globalConfigs, modules } = await fetchVersionDetails(verId);
      setSelectedTemplateVersion({ ...v, globalConfigs, modules });
    }
    if (!isEdit) {
      setGlobalConfigs([]);
      setModuleConfigs([]);
    }
  };

  // Handle Customer Change
  const handleCustomerChange = async (custId: string, resetEnv = true) => {
    if (resetEnv) {
      form.setFieldsValue({ environmentId: undefined });
    }
    const cust = customers.find((c) => c.id === custId);
    setSelectedCustomer(cust);

    try {
      const envsRes = await getCustomerEnvironments(custId);
      const envs = (envsRes as any).list;
      setEnvironments(envs);
    } catch (e) {
      console.error(e);
      message.error("Failed to load customer environments");
      setEnvironments([]);
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

  const onFinish = async (values: any) => {
    if (!selectedTemplateVersion) {
      message.error("Please select a valid template version");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Compilation> = {
        ...values,
        templateVersion: values.templateVersion, // ID
        templateName: templateDetail?.name,
        customerName: selectedCustomer?.name,
        environmentName: environments.find((e) => e.id === values.environmentId)
          ?.name,
        globalConfigs,
        moduleConfigs,
      };

      if (isEdit && compilationId) {
        await updateCompilation(compilationId, payload);
      } else {
        await createCompilation(payload);
      }
      message.success(t.compilationDetail.saveSuccess);
      navigate("/compilations");
    } catch (e) {
      message.error("Save failed");
    } finally {
      setSubmitting(false);
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
          <Title level={4} className={styles.title}>
            {isEdit
              ? t.compilationDetail.editTitle
              : t.compilationDetail.newTitle}
          </Title>
        </div>
        <Space>
          <Button onClick={() => navigate("/compilations")}>
            {t.compilationDetail.cancel}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={form.submit}
          >
            {t.compilationDetail.save}
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{}}
        >
          {/* Basic Info Section */}
          <Card
            title={t.compilationDetail.basicInfo}
            className={styles.card}
            bordered={false}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label={t.compilationDetail.name}
                  rules={[{ required: true }]}
                >
                  <Input placeholder="e.g. Online Deployment V1" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label={t.compilationDetail.template} required>
                  <Space.Compact block>
                    <Form.Item
                      name="templateId"
                      noStyle
                      rules={[{ required: true }]}
                    >
                      <Select
                        style={{ width: "60%" }}
                        onChange={(v) => handleTemplateChange(v)}
                        placeholder={t.compilationDetail.template}
                      >
                        {templates.map((t) => (
                          <Option key={t.id} value={t.id}>
                            {t.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="templateVersion"
                      noStyle
                      rules={[{ required: true }]}
                    >
                      <Select
                        style={{ width: "40%" }}
                        onChange={handleVersionChange}
                        disabled={!selectedTemplateId}
                        placeholder={t.compilationDetail.templateVersion}
                        loading={loading}
                      >
                        {versions.map((v) => (
                          <Option key={v.id} value={v.id}>
                            {v.version}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label={t.compilationDetail.customer} required>
                  <Space.Compact block>
                    <Form.Item
                      name="customerId"
                      noStyle
                      rules={[{ required: true }]}
                    >
                      <Select
                        style={{ width: "50%" }}
                        onChange={(v) => handleCustomerChange(v)}
                        placeholder={t.compilationDetail.selectCustomer}
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
                      noStyle
                      rules={[{ required: true }]}
                    >
                      <Select
                        style={{ width: "50%" }}
                        disabled={!form.getFieldValue("customerId")}
                        placeholder={t.compilationDetail.selectEnvironment}
                      >
                        {(environments || []).map((e) => (
                          <Option key={e.id} value={e.id}>
                            {e.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label={t.compilationDetail.desc || "Description"}
                >
                  <TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Configuration Section */}
          <div className={styles.configSection}>
            <Card
              title={t.compilationDetail.globalConfigTitle}
              className={styles.card}
              bordered={false}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ padding: "0 24px 24px" }}>
                {selectedTemplateVersion ? (
                  <GlobalConfigValueTable
                    configs={selectedTemplateVersion.globalConfigs}
                    values={globalConfigs}
                    onChange={handleGlobalConfigChange}
                  />
                ) : (
                  <div className={styles.emptyState}>
                    {t.compilationDetail.templateVersion}
                  </div>
                )}
              </div>
            </Card>

            <Card
              title={t.compilationDetail.moduleConfigTitle}
              className={styles.card}
              bordered={false}
              style={{ marginTop: 24 }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ padding: "0 24px 24px" }}>
                {selectedTemplateVersion ? (
                  <ModuleConfigValueTabs
                    modules={selectedTemplateVersion.modules}
                    globalConfigs={selectedTemplateVersion.globalConfigs}
                    values={moduleConfigs}
                    onChange={handleModuleConfigChange}
                  />
                ) : (
                  <div className={styles.emptyState}>
                    {t.compilationDetail.templateVersion}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default CompilationDetail;
