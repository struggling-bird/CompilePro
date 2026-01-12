import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  getTemplatesList,
  getTemplateVersions,
  TemplateListItem,
} from "../../../services/templates";
import {
  listCustomers,
  getCustomerEnvironments,
} from "../../../services/customers";
import { TemplateVersion, Customer, Environment } from "../../../types";

const { Option } = Select;
const { TextArea } = Input;

interface CompilationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialValues?: any;
  title?: string;
}

const CompilationModal: React.FC<CompilationModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  title,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Data Sources
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);

  // Selected Names (for payload construction)
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>();
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>();

  // Fetch base lists
  useEffect(() => {
    if (visible) {
      const init = async () => {
        try {
          const [tplRes, custRes] = await Promise.all([
            getTemplatesList({ pageSize: 100 }),
            listCustomers(),
          ]);
          setTemplates(tplRes.items || []);
          setCustomers(custRes);

          // Handle Edit Mode Initial Data
          if (initialValues) {
            form.setFieldsValue(initialValues);

            // Fetch dependent lists
            if (initialValues.templateId) {
              handleTemplateChange(initialValues.templateId, false);
            }
            if (initialValues.customerId) {
              handleCustomerChange(initialValues.customerId, false);
            }
          } else {
            form.resetFields();
            setVersions([]);
            setEnvironments([]);
          }
        } catch (e) {
          message.error(t.compilationDetail.loadFormFailed);
        }
      };
      init();
    }
  }, [visible, initialValues]);

  const handleTemplateChange = async (tplId: string, resetVersion = true) => {
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) setSelectedTemplateName(tpl.name);

    if (resetVersion) {
      form.setFieldsValue({ templateVersion: undefined });
    }

    try {
      const versionsRes = await getTemplateVersions(tplId);
      const vList = (versionsRes as any).data || versionsRes || [];
      setVersions(vList);
    } catch (e) {
      console.error(e);
      message.error(t.compilationDetail.loadVersionsFailed);
    }
  };

  const handleCustomerChange = async (custId: string, resetEnv = true) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) setSelectedCustomerName(cust.name);

    if (resetEnv) {
      form.setFieldsValue({ environmentId: undefined });
    }

    try {
      const envsRes = await getCustomerEnvironments(custId);
      const envs = (envsRes as any).list;
      setEnvironments(envs || []);
    } catch (e) {
      console.error(e);
      message.error(t.compilationDetail.loadEnvsFailed);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Enhance values with names
      // Note: If we are in edit mode and didn't change selection,
      // names might not be in state if we rely solely on onChange.
      // But we set them in useEffect if lists are loaded.
      // To be safe, find them again.

      const tpl = templates.find((t) => t.id === values.templateId);
      const cust = customers.find((c) => c.id === values.customerId);
      const env = environments.find((e) => e.id === values.environmentId);

      const payload = {
        ...values,
        templateName: tpl?.name || initialValues?.templateName,
        customerName: cust?.name || initialValues?.customerName,
        environmentName: env?.name || initialValues?.environmentName,
      };

      await onSubmit(payload);
      onCancel();
    } catch (e) {
      // Validation error or submit error
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={title || t.compilationList.newCompilation}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={submitting}
      width={600}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="name"
          label={t.compilationDetail.name}
          rules={[{ required: true, message: t.compilationDetail.enterName }]}
        >
          <Input placeholder={t.compilationDetail.namePlaceholder} />
        </Form.Item>

        <Form.Item label={t.compilationDetail.template} required>
          <div style={{ display: "flex", gap: 8 }}>
            <Form.Item
              name="templateId"
              noStyle
              rules={[{ required: true, message: t.compilationDetail.template }]}
            >
              <Select
                style={{ flex: 3 }}
                onChange={(v) => handleTemplateChange(v)}
                placeholder={t.compilationDetail.selectTemplatePlaceholder}
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
              rules={[{ required: true, message: t.compilationDetail.templateVersion }]}
            >
              <Select
                style={{ flex: 2 }}
                placeholder={t.compilationDetail.selectVersionPlaceholder}
                disabled={!versions.length}
              >
                {versions.map((v) => (
                  <Option key={v.id} value={v.id}>
                    {v.version}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label={t.compilationDetail.customer} required>
          <div style={{ display: "flex", gap: 8 }}>
            <Form.Item
              name="customerId"
              noStyle
              rules={[{ required: true, message: t.compilationDetail.selectCustomer }]}
            >
              <Select
                style={{ flex: 1 }}
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
              rules={[{ required: true, message: t.compilationDetail.selectEnvironment }]}
            >
              <Select
                style={{ flex: 1 }}
                placeholder={t.compilationDetail.selectEnvPlaceholder}
                disabled={!environments.length}
              >
                {environments.map((e) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item name="description" label={t.compilationDetail.desc}>
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompilationModal;
