import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Switch,
  Table,
  message,
  Modal,
  Breadcrumb,
  Card,
  Space,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { EnvironmentNode } from "../../../../types";
import {
  getEnvironment,
  createEnvironment,
  updateEnvironment,
  listNodes,
  createNode,
  updateNode,
  deleteNode,
} from "../../../../services/environments";
import NodeModal from "../components/NodeModal";
import NodeCredentialsList from "../components/NodeCredentialsList";

const EnvironmentDetail: React.FC = () => {
  const { customerId, envId } = useParams<{
    customerId: string;
    envId: string;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form] = Form.useForm();

  const isNew = envId === "new" || !envId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Nodes state
  const [nodes, setNodes] = useState<EnvironmentNode[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<EnvironmentNode[]>([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [nodeSearch, setNodeSearch] = useState("");
  const [nodeModalVisible, setNodeModalVisible] = useState(false);
  const [currentNode, setCurrentNode] = useState<
    Partial<EnvironmentNode> | undefined
  >(undefined);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const fetchEnv = async () => {
    if (isNew || !customerId || !envId) return;
    try {
      setLoading(true);
      const env = await getEnvironment(customerId, envId);
      form.setFieldsValue(env);
      await fetchNodes();
    } catch (err) {
      message.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchNodes = async () => {
    if (isNew || !customerId || !envId) return;
    try {
      setNodesLoading(true);
      const list = await listNodes(customerId, envId);
      setNodes(list);
      setFilteredNodes(list);
    } catch (err) {
      message.error("Failed");
    } finally {
      setNodesLoading(false);
    }
  };

  useEffect(() => {
    fetchEnv();
  }, [customerId, envId]);

  useEffect(() => {
    const lower = nodeSearch.toLowerCase();
    const filtered = nodes.filter(
      (n: EnvironmentNode) =>
        n.ip.toLowerCase().includes(lower) ||
        n.host.toLowerCase().includes(lower) ||
        (n.domain && n.domain.toLowerCase().includes(lower))
    );
    setFilteredNodes(filtered);
  }, [nodeSearch, nodes]);

  const onSaveEnv = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (isNew) {
        if (!customerId) return;
        const res = await createEnvironment(customerId, values);
        message.success(t.environment.saveSuccess);
        navigate(`/customers/${customerId}/environments/${res.id}`, {
          replace: true,
        });
      } else {
        if (!customerId || !envId) return;
        await updateEnvironment(customerId, envId, values);
        message.success(t.environment.saveSuccess);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  const onSaveNode = async (values: Partial<EnvironmentNode>) => {
    if (!customerId || !envId) return;
    try {
      let nodeId = currentNode?.id;
      if (nodeId) {
        await updateNode(customerId, envId, nodeId, values);
        message.success(t.environment.saveNodeSuccess);
      } else {
        await createNode(customerId, envId, values);
        message.success(t.environment.saveNodeSuccess);
      }

      setNodeModalVisible(false);
      fetchNodes();
    } catch (err) {
      console.error(err);
      message.error("Failed");
    }
  };

  const onEditNode = (node: EnvironmentNode) => {
    setCurrentNode(node);
    setNodeModalVisible(true);
  };

  const onDeleteNode = async (nodeId: string) => {
    if (!customerId || !envId) return;
    Modal.confirm({
      title: t.environment.deleteNodeConfirm,
      onOk: async () => {
        try {
          await deleteNode(customerId, envId, nodeId);
          message.success(t.environment.deleteNodeSuccess);
          fetchNodes();
        } catch (err) {
          message.error("Failed");
        }
      },
    });
  };

  const nodeColumns = [
    { title: t.environment.ip, dataIndex: "ip", key: "ip" },
    { title: t.environment.host, dataIndex: "host", key: "host" },
    { title: t.environment.os, dataIndex: "os", key: "os" },
    { title: t.environment.cpu, dataIndex: "cpu", key: "cpu" },
    { title: t.environment.memory, dataIndex: "memory", key: "memory" },
    {
      title: t.customerList.action,
      key: "action",
      render: (_: any, r: EnvironmentNode) => (
        <div className="space-x-2">
          <Button type="link" onClick={() => onEditNode(r)}>
            {t.environment.edit}
          </Button>
          <Button type="link" danger onClick={() => onDeleteNode(r.id)}>
            {t.customerList.delete}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, height: "100%", overflow: "auto" }}>
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: (
              <a onClick={() => navigate("/customers")}>{t.layout.customers}</a>
            ),
          },
          {
            title: (
              <a
                onClick={() =>
                  navigate(`/customers/${customerId}/environments`)
                }
              >
                {t.environment.title}
              </a>
            ),
          },
          { title: isNew ? t.environment.add : t.environment.detail },
        ]}
      />

      <Card
        title={t.environment.basicInfo}
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onSaveEnv}
            loading={saving}
          >
            {t.environment.save}
          </Button>
        }
        bordered={false}
        style={{ marginBottom: 24 }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={t.environment.name}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="url"
                label={t.environment.url}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="account" label={t.environment.account}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="password" label={t.environment.password}>
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supportRemote"
                label={t.environment.supportRemote}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="remoteMethod" label={t.environment.remoteMethod}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="remark" label={t.environment.remark}>
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {!isNew && (
        <Card
          title={t.environment.nodes}
          extra={
            <Space>
              <Input.Search
                placeholder={t.environment.nodeSearchPlaceholder}
                allowClear
                onSearch={(val: string) => setNodeSearch(val)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNodeSearch(e.target.value)
                }
                style={{ width: 250 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentNode(undefined);
                  setNodeModalVisible(true);
                }}
              >
                {t.environment.addNode}
              </Button>
            </Space>
          }
          bordered={false}
        >
          <Table
            rowKey="id"
            columns={nodeColumns}
            dataSource={filteredNodes}
            loading={nodesLoading}
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: "0 16px" }}>
                  <NodeCredentialsList
                    customerId={customerId!}
                    envId={envId!}
                    nodeId={record.id}
                  />
                </div>
              ),
              expandedRowKeys,
              onExpand: (expanded, record) => {
                setExpandedRowKeys(
                  expanded
                    ? [...expandedRowKeys, record.id]
                    : expandedRowKeys.filter((k) => k !== record.id)
                );
              },
            }}
          />
        </Card>
      )}

      <NodeModal
        visible={nodeModalVisible}
        onCancel={() => setNodeModalVisible(false)}
        onOk={onSaveNode}
        initialValues={currentNode}
      />
    </div>
  );
};

export default EnvironmentDetail;
