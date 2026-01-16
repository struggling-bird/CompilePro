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
  Modal,
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
      message.error(t.templateList.fetchFailed);
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
    message.info(t.templateList.toggleNotImpl);
  };

  const columns = [
    {
      title: t.templateList.name,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.templateList.description,
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: t.templateList.latestVersion,
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
      title: t.templateList.updateTime,
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (val: string) =>
        val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: t.templateList.updater,
      dataIndex: "updater",
      key: "updater",
      width: 120,
    },
    {
      title: t.templateList.author,
      dataIndex: "author",
      key: "author",
      width: 120,
    },
    {
      title: t.templateList.createdDate,
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (val: string) =>
        val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: t.templateList.action,
      key: "action",
      width: 240,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => navigate(`/templates/${record.id}`)}
          >
            {t.templateList.edit}
          </Button>
          <Popconfirm
            title={t.templateList.deleteConfirm}
            onConfirm={async () => {
              try {
                await deleteTemplate(record.id);
                message.success(t.templateList.deleteSuccess);
                const values = form.getFieldsValue();
                fetchTemplates(values, current, pageSize);
              } catch (e: any) {
                if (e?.response?.status === 409) {
                  Modal.confirm({
                    title: t.templateList.deleteConfirmForceTitle,
                    content: t.templateList.deleteConfirmForceContent,
                    okText: t.templateDetail.confirm,
                    cancelText: t.templateDetail.cancel,
                    onOk: async () => {
                      try {
                        await deleteTemplate(record.id, true);
                        message.success(t.templateList.deleteSuccess);
                        const values = form.getFieldsValue();
                        fetchTemplates(values, current, pageSize);
                      } catch (err) {
                        console.error(err);
                        message.error(t.templateList.deleteFailed);
                      }
                    },
                  });
                } else {
                  console.error(e);
                  message.error(t.templateList.deleteFailed);
                }
              }
            }}
            okText={t.templateDetail.yes || "Yes"}
            cancelText={t.templateDetail.no || "No"}
          >
            <Button type="link" danger>
              {t.templateList.delete}
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
              <Form.Item name="name" label={t.templateList.name} style={{ marginBottom: 0 }}>
                <Input placeholder={t.templateList.namePlaceholder} allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="author"
                label={t.templateList.author}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder={t.templateList.creatorPlaceholder} allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="description"
                label={t.templateList.description}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder={t.templateList.descPlaceholder} allowClear />
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
                    {t.templateList.search}
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    {t.templateList.reset}
                  </Button>
                  <Button type="link" onClick={() => setExpand(true)}>
                    {t.templateList.expand} <DownOutlined />
                  </Button>
                </Space>
              </Col>
            )}

            {expand && (
              <>
                <Col span={6}>
                  <Form.Item
                    name="createTime"
                    label={t.templateList.createdDate}
                    style={{ marginBottom: 0 }}
                  >
                    <RangePicker style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="updateTime"
                    label={t.templateList.updateTime}
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
                      {t.templateList.search}
                    </Button>
                    <Button onClick={handleReset} icon={<ReloadOutlined />}>
                      {t.templateList.reset}
                    </Button>
                    <Button type="link" onClick={() => setExpand(false)}>
                      {t.templateList.collapse} <UpOutlined />
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
          {t.templateList.newTemplate}
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
          showTotal: (total) => t.templateList.totalItems.replace("{{count}}", String(total)),
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
