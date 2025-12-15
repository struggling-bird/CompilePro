import React, { useEffect, useState } from "react";
import { Modal, Button, Table, message, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
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
  visible: boolean;
  onCancel: () => void;
  customerId: string;
  envId: string;
  nodeId: string;
}

const CredentialModal: React.FC<Props> = ({
  visible,
  onCancel,
  customerId,
  envId,
  nodeId,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<NodeCredential[]>([]);
  
  // Edit Modal State
  const [editVisible, setEditVisible] = useState(false);
  const [currentCred, setCurrentCred] = useState<Partial<NodeCredential> | undefined>(undefined);

  const fetchList = async () => {
    if (!visible) return;
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
    if (visible) {
      fetchList();
    }
  }, [visible, customerId, envId, nodeId]);

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
        await updateNodeCredential(customerId, envId, nodeId, currentCred.id, values);
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
    { title: t.environment.type, dataIndex: "type", key: "type" },
    { title: t.environment.username, dataIndex: "username", key: "username" },
    { title: t.environment.description, dataIndex: "description", key: "description" },
    {
      title: t.customerList.action,
      key: "action",
      render: (_: any, r: NodeCredential) => (
        <div className="space-x-2">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentCred(r);
              setEditVisible(true);
            }}
          />
          <Popconfirm
            title={t.environment.deleteConfirm}
            onConfirm={() => handleDelete(r.id!)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={t.environment.credentials}
        open={visible}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>
            {t.templateDetail.back}
          </Button>,
        ]}
        width={800}
      >
        <div className="mb-4 flex justify-end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentCred(undefined);
              setEditVisible(true);
            }}
          >
            {t.environment.addCredential}
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false}
        />
      </Modal>

      <CredentialEditModal
        visible={editVisible}
        initialValues={currentCred}
        onCancel={() => setEditVisible(false)}
        onOk={handleEditSave}
      />
    </>
  );
};

export default CredentialModal;
