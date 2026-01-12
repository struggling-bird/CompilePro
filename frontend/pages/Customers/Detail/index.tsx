import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import type { Customer } from "../../../types";
import {
  getCustomer,
  createCustomer,
  updateCustomer,
} from "../../../services/customers";
import {
  message,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Card,
  Space,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";

const CustomerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const isNew = !customerId;
  const { t } = useLanguage();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!customerId) {
        // Initialize form for new customer
        form.setFieldsValue({
          status: "Active",
          contractDate: dayjs(),
        });
        return;
      }
      try {
        setLoading(true);
        const data = await getCustomer(customerId);
        form.setFieldsValue({
          ...data,
          contractDate: data.contractDate
            ? dayjs(data.contractDate)
            : undefined,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "加载失败";
        message.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const customerData = {
        ...values,
        contractDate: values.contractDate
          ? values.contractDate.format("YYYY-MM-DD")
          : undefined,
      };

      if (isNew) {
        await createCustomer(customerData);
        message.success("创建成功");
        navigate("/customers");
      } else {
        await updateCustomer(customerId!, customerData);
        message.success("保存成功");
        navigate("/customers");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存失败";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, height: "100%", overflow: "auto" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/customers")}
              type="text"
            />
            {isNew ? t.customerDetail.newTitle : t.customerDetail.editTitle}
          </Space>
        }
        bordered={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: "Active" }}
          autoComplete="off"
        >
          <h3 style={{ marginBottom: 24, fontSize: 16, fontWeight: 500 }}>
            {t.customerDetail.basicInfo}
          </h3>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t.customerDetail.name}
                rules={[{ required: true, message: "Please input name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label={t.customerDetail.status}
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="Active">
                    {t.customerDetail.statusActive}
                  </Select.Option>
                  <Select.Option value="Inactive">
                    {t.customerDetail.statusInactive}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPerson" label={t.customerDetail.contact}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label={t.customerDetail.phone}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label={t.customerDetail.email}
                rules={[{ type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contractDate"
                label={t.customerDetail.contractDate}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label={t.customerDetail.address}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={() => navigate("/customers")}>
                {t.customerDetail.cancel}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                {t.customerDetail.save}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CustomerDetailPage;
