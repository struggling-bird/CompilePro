import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Table, message, Modal, Input, Form, Breadcrumb } from "antd";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { Environment } from "../../../../types";
import {
  listEnvironments,
  deleteEnvironment,
} from "../../../../services/environments";

const EnvironmentList: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [filteredEnvs, setFilteredEnvs] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchList = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const list = await listEnvironments(customerId);
      setEnvironments(list);
      setFilteredEnvs(list);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to load environments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [customerId]);

  useEffect(() => {
    const lower = searchText.toLowerCase();
    const filtered = environments.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        (e.remark && e.remark.toLowerCase().includes(lower))
    );
    setFilteredEnvs(filtered);
  }, [searchText, environments]);

  const onDelete = async (envId: string) => {
    if (!customerId) return;
    Modal.confirm({
      title: t.environment.deleteConfirm,
      onOk: async () => {
        try {
          await deleteEnvironment(customerId, envId);
          message.success(t.environment.deleteSuccess);
          fetchList();
        } catch (err) {
          message.error("Failed");
        }
      },
    });
  };

  const columns = [
    { title: t.environment.name, dataIndex: "name", key: "name" },
    { title: t.environment.url, dataIndex: "url", key: "url" },
    {
      title: t.environment.supportRemote,
      dataIndex: "supportRemote",
      key: "supportRemote",
      render: (val: boolean) => (val ? t.environment.yes : t.environment.no),
    },
    {
      title: t.environment.remoteMethod,
      dataIndex: "remoteMethod",
      key: "remoteMethod",
    },
    { title: t.environment.remark, dataIndex: "remark", key: "remark" },
    {
      title: t.customerList.action,
      key: "action",
      render: (_: any, record: Environment) => (
        <div className="space-x-2">
          <Button
            type="link"
            onClick={() =>
              navigate(`/customers/${customerId}/environments/${record.id}`)
            }
          >
            {t.environment.edit}
          </Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>
            {t.customerList.delete}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="mb-4 flex justify-between items-center">
        <Breadcrumb
          items={[
            {
              title: (
                <a onClick={() => navigate("/customers")}>
                  {t.layout.customers}
                </a>
              ),
            },
            { title: t.environment.title },
          ]}
        />
        <Button
          type="primary"
          onClick={() => navigate(`/customers/${customerId}/environments/new`)}
        >
          {t.environment.add}
        </Button>
      </div>
      <div className="mb-4">
        <Input.Search
          placeholder={t.environment.searchPlaceholder}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredEnvs}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default EnvironmentList;
