import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Select, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_DEPLOYMENTS } from "../../../constants";
import styles from "../styles/List.module.less";

const ManageListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const [env, setEnv] = useState<string | undefined>(undefined);
  const data = MOCK_DEPLOYMENTS;

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return data.filter((d) => {
      const passK =
        !k ||
        [d.name, d.customerName].some((f) =>
          (f || "").toLowerCase().includes(k)
        );
      const passEnv = !env || d.environment === env;
      return passK && passEnv;
    });
  }, [keyword, env]);

  const columns = [
    { title: t.manageList.name, dataIndex: "name", key: "name" },
    {
      title: t.manageList.customer,
      dataIndex: "customerName",
      key: "customerName",
    },
    { title: t.manageList.version, dataIndex: "version", key: "version" },
    {
      title: t.manageList.environment,
      dataIndex: "environment",
      key: "environment",
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: t.manageList.action,
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/manage/deployments/${record.id}`)}
        >
          {t.manageList.view}
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          placeholder={t.manageList.searchPlaceholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={styles.search}
        />
        <Select
          allowClear
          placeholder={t.manageList.environment}
          value={env}
          onChange={setEnv}
          className={styles.select}
          options={Array.from(new Set(data.map((d) => d.environment))).map(
            (e) => ({ label: e, value: e })
          )}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/manage/new")}
        >
          {t.manageList.newDeployment}
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ManageListPage;
