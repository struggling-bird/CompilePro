import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Button,
  Tag,
  Space,
  message,
  Typography,
  Form,
  Card,
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  listCompilations,
  deleteCompilation,
  createCompilation,
} from "../../../services/compilations";
import type { Compilation } from "../../../types";
import styles from "../styles/List.module.less";
import dayjs from "dayjs";
import CompilationModal from "../components/CompilationModal";

const { Text } = Typography;

const CompilationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Compilation[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const fetchList = async (
    values: any = {},
    page: number = current,
    size: number = pageSize
  ) => {
    setLoading(true);
    try {
      const query: any = { ...values, page, pageSize: size };
      const res = await listCompilations(query);
      setData(res.items || []);
      setTotal(res.meta?.total || 0);
      setCurrent(res.meta?.page || page);
      setPageSize(res.meta?.pageSize || size);
    } catch (err) {
      console.error(err);
      message.error(t.compilationList.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = (values: any) => {
    setCurrent(1);
    fetchList(values, 1, pageSize);
  };

  const handleCreate = async (values: any) => {
    try {
      const newId = await createCompilation(values);
      message.success(t.common.success || t.compilationList.createSuccess);
      setCreateModalVisible(false);
      navigate(`/compilations/${newId}`);
    } catch (e) {
      message.error(t.compilationList.createFailed);
    }
  };

  const columns: any[] = [
    {
      title: t.compilationList.name,
      dataIndex: "name",
      key: "name",
      width: 220,
      fixed: "left",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.compilationList.template,
      key: "template",
      width: 200,
      render: (_: any, record: Compilation) => (
        <Space direction="vertical" size={0}>
          <Text>{record.templateName || "-"}</Text>
          <Tag color="blue">{record.templateVersion || "v1.0"}</Tag>
        </Space>
      ),
    },
    {
      title: t.compilationList.customer,
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
    },
    {
      title: t.compilationList.environment,
      dataIndex: "environmentName",
      key: "environmentName",
      width: 150,
    },
    {
      title: t.compilationList.lastBuildTime,
      dataIndex: "lastBuildTime",
      key: "lastBuildTime",
      width: 180,
      render: (val: string) =>
        val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: t.compilationList.lastBuilder,
      dataIndex: "lastBuilder",
      key: "lastBuilder",
      width: 120,
    },
    {
      title: t.compilationList.createdBy,
      dataIndex: "createdBy",
      key: "createdBy",
      width: 120,
    },
    {
      title: t.compilationList.createdAt,
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (val: string) =>
        val ? dayjs(val).format("YYYY-MM-DD HH:mm:ss") : "-",
    },
    {
      title: t.compilationList.action,
      key: "action",
      width: 280,
      fixed: "right",
      render: (_: any, record: Compilation) => (
        <Space>
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => navigate(`/compilations/${record.id}`)}
          >
            {t.compilationList.edit}
          </Button>
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => {
              // TODO: Navigate to execution or show modal
              message.info(t.compilationList.executeFeature);
            }}
          >
            {t.compilationList.execute}
          </Button>
          <Button
            type="link"
            className={styles.actionBtn}
            onClick={() => {
              // TODO: History
              message.info(t.compilationList.historyFeature);
            }}
          >
            {t.compilationList.history}
          </Button>
          <Popconfirm
            title={t.compilationList.deleteConfirm}
            onConfirm={async () => {
              try {
                await deleteCompilation(record.id);
                message.success(t.common.success);
                const values = form.getFieldsValue();
                fetchList(values, current, pageSize);
              } catch (e) {
                message.error(t.compilationList.deleteFailed);
              }
            }}
            okText={t.templateDetail?.yes || "Yes"}
            cancelText={t.templateDetail?.no || "No"}
          >
            <Button type="link" danger>
              {t.compilationList.delete}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.searchCard} bordered={false}>
        <Form form={form} onFinish={onFinish} autoComplete="off">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="name" noStyle>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder={t.compilationList.searchPlaceholder}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Space>
                <Button type="primary" htmlType="submit">
                  {t.compilationList.search}
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    form.resetFields();
                    fetchList();
                  }}
                >
                  {t.compilationList.reset}
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className={styles.tableCard} bordered={false}>
        <div className={styles.toolbar}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            {t.compilationList.newCompilation}
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            current,
            pageSize,
            total,
            onChange: (p, s) => fetchList(form.getFieldsValue(), p, s),
          }}
        />
      </Card>
      <CompilationModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CompilationListPage;
