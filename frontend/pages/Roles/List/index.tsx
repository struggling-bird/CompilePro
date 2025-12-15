import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_ROLES } from "../../../constants";
import type { Role } from "../../../types";

const RoleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const data = MOCK_ROLES;

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return data;
    return data.filter((r) =>
      [r.name, r.description].some((f) => (f || "").toLowerCase().includes(k))
    );
  }, [keyword]);

  const columns = [
    {
      title: t.roleList.name,
      dataIndex: "name",
      key: "name",
      render: (v: string, r: Role) => (
        <span>
          {v} {r.isSystem && <Tag>system</Tag>}
        </span>
      ),
    },
    {
      title: t.roleList.description,
      dataIndex: "description",
      key: "description",
    },
    {
      title: t.roleList.permissions,
      key: "permissions",
      render: (_: any, r: Role) => (
        <Tag>{r.permissions.length} permissions</Tag>
      ),
    },
    {
      title: t.roleList.action,
      key: "action",
      render: (_: any, r: Role) => (
        <Button type="link" onClick={() => navigate(`/roles/${r.id}`)}>
          {t.roleList.edit}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder={t.roleList.searchPlaceholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/roles/new")}
        >
          {t.roleList.newRole}
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

export default RoleListPage;
