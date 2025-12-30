import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Button,
  Tag,
  Switch,
  Space,
  message,
  Typography,
  Form,
  DatePicker,
  Card,
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { getTemplatesList, deleteTemplate } from "../../../services/templates";
import type { ProjectTemplate } from "../../../types";
import styles from "../styles/List.module.less";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [expand, setExpand] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchTemplates = async (
    values: any = {},
    page: number = current,
    size: number = pageSize
  ) => {
    setLoading(true);
    try {
      const query: any = {};
      if (values.name) query.name = values.name;
      if (values.author) query.author = values.author;
      if (values.description) query.description = values.description;
      if (values.createTime) {
        query.createdFrom = values.createTime[0].toISOString();
        query.createdTo = values.createTime[1].toISOString();
      }
      if (values.updateTime) {
        query.updatedFrom = values.updateTime[0].toISOString();
        query.updatedTo = values.updateTime[1].toISOString();
      }
      query.page = page;
      query.pageSize = size;

      const res = await getTemplatesList(query);
      setData(res.items || []);
      setTotal(res.meta?.total || 0);
      setCurrent(res.meta?.page || page);
      setPageSize(res.meta?.pageSize || size);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const onFinish = (values: any) => {
    setCurrent(1);
    fetchTemplates(values, 1, pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    fetchTemplates();
  };

  const handleToggleStatus = (id: string, checked: boolean) => {
    // API to toggle status not implemented yet in this turn?
    // Just mock for now or disable
    message.info("Toggle status not implemented yet");
  };

  const columns = [
    {
      title: t.templateList.name || "Template Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.templateList.description || "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: t.templateList.latestVersion || "Latest Version",
      dataIndex: "latestVersion",
      key: "latestVersion",
      render: (text: string) =>
        text ? (
          <Tag color="blue" className={styles.versionTag}>
            v{text}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Update Time",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (val: string) =>
        val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: "Updater",
      dataIndex: "updater",
      key: "updater",
      width: 120,
    },
    {
      title: t.templateList.author || "Creator",
      dataIndex: "author",
      key: "author",
      width: 120,
    },
    {
      title: t.templateList.createdDate || "Create Time",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (val: string) =>
        val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: t.templateList.action || "Action",
      key: "action",
      width: 240,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => navigate(`/templates/${record.id}`)}
          >
            {t.templateList.edit || "Edit"}
          </Button>
          <Popconfirm
            title="Are you sure to delete this template?"
            onConfirm={async () => {
              try {
                await deleteTemplate(record.id);
                message.success("Template deleted");
                const values = form.getFieldsValue();
                fetchTemplates(values, current, pageSize);
              } catch (e) {
                console.error(e);
                message.error("Delete failed");
              }
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.searchCard} bordered={false}>
        <Form form={form} onFinish={onFinish}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Form.Item name="name" label="Name" style={{ marginBottom: 0 }}>
                <Input placeholder="Template Name" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="author"
                label="Author"
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Creator" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="description"
                label="Desc"
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Description" allowClear />
              </Form.Item>
            </Col>
            {!expand && (
              <Col span={6} style={{ textAlign: "right" }}>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                  >
                    Search
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    Reset
                  </Button>
                  <Button type="link" onClick={() => setExpand(true)}>
                    Expand <DownOutlined />
                  </Button>
                </Space>
              </Col>
            )}

            {expand && (
              <>
                <Col span={6}>
                  <Form.Item
                    name="createTime"
                    label="Create Time"
                    style={{ marginBottom: 0 }}
                  >
                    <RangePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="updateTime"
                    label="Update Time"
                    style={{ marginBottom: 0 }}
                  >
                    <RangePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                    >
                      Search
                    </Button>
                    <Button onClick={handleReset} icon={<ReloadOutlined />}>
                      Reset
                    </Button>
                    <Button type="link" onClick={() => setExpand(false)}>
                      Collapse <UpOutlined />
                    </Button>
                  </Space>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </Card>

      <div className={styles.toolbar} style={{ marginTop: 16 }}>
        <div className={styles.left}></div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/templates/new")}
        >
          {t.templateList.newTemplate || "New Template"}
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current,
          pageSize,
          total,
          showTotal: (t) => `Total ${t} items`,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size || pageSize);
            const values = form.getFieldsValue();
            fetchTemplates(values, page, size || pageSize);
          },
        }}
      />
    </div>
  );
};

export default TemplateListPage;
