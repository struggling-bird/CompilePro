import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm, Tooltip, Card } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { NodeCredential } from "../../../../types";
import {
  listNodeCredentials,
  createNodeCredential,
  updateNodeCredential,
  deleteNodeCredential,
} from "../../../../services/environments";
import CredentialEditModal from "./CredentialEditModal";

interface Props {
  customerId: string;
  envId: string;
  nodeId: string;
}

const NodeCredentialsList: React.FC<Props> = ({
  customerId,
  envId,
  nodeId,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<NodeCredential[]>([]);

  // Edit Modal State
  const [editVisible, setEditVisible] = useState(false);
  const [currentCred, setCurrentCred] = useState<
    Partial<NodeCredential> | undefined
  >(undefined);

  const fetchList = async () => {
    try {
      setLoading(true);
      const data = await listNodeCredentials(customerId, envId, nodeId);
      setList(data);
    } catch (e) {
      message.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [customerId, envId, nodeId]);

  const handleDelete = async (credId: string) => {
    try {
      await deleteNodeCredential(customerId, envId, nodeId, credId);
      message.success(t.environment.deleteSuccess);
      fetchList();
    } catch (e) {
      message.error("Failed to delete credential");
    }
  };

  const handleEditSave = async (values: Partial<NodeCredential>) => {
    try {
      if (currentCred?.id) {
        await updateNodeCredential(
          customerId,
          envId,
          nodeId,
          currentCred.id,
          values
        );
        message.success(t.environment.saveSuccess);
      } else {
        await createNodeCredential(customerId, envId, nodeId, values);
        message.success(t.environment.saveSuccess);
      }
      setEditVisible(false);
      fetchList();
    } catch (e) {
      message.error("Failed to save credential");
    }
  };

  const columns = [
    {
      title: t.environment.type,
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (text: string) => (
        <span className="font-medium text-slate-700">{text}</span>
      ),
    },
    {
      title: t.environment.username,
      dataIndex: "username",
      key: "username",
      width: 200,
    },
    {
      title: t.environment.description,
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span className="text-slate-500">{text || "-"}</span>
      ),
    },
    {
      title: t.customerList.action,
      key: "action",
      width: 120,
      render: (_: any, r: NodeCredential) => (
        <div className="space-x-2">
          <Tooltip title={t.environment.edit}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentCred(r);
                setEditVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title={t.environment.deleteConfirm}
            onConfirm={() => handleDelete(r.id!)}
          >
            <Tooltip title={t.customerList.delete}>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <div className="flex items-center gap-2 text-slate-600">
          <KeyOutlined />
          <span>{t.environment.credentials}</span>
        </div>
      }
      extra={
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentCred(undefined);
            setEditVisible(true);
          }}
        >
          {t.environment.addCredential}
        </Button>
      }
      className="bg-slate-50 border-slate-200"
      styles={{ body: { padding: 0 } }}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={false}
        size="small"
        virtual
      />

      <CredentialEditModal
        visible={editVisible}
        initialValues={currentCred}
        onCancel={() => setEditVisible(false)}
        onOk={handleEditSave}
      />
    </Card>
  );
};

export default NodeCredentialsList;
