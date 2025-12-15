import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Input, Button, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_TEAM_MEMBERS } from "../../../constants";
import type { TeamMember } from "../../../types";

const MemberListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const data = MOCK_TEAM_MEMBERS;

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return data;
    return data.filter((m) =>
      [m.name, m.email, m.role].some((f) => (f || "").toLowerCase().includes(k))
    );
  }, [keyword]);

  const columns = [
    { title: t.memberList.name, dataIndex: "name", key: "name" },
    { title: t.memberList.email, dataIndex: "email", key: "email" },
    {
      title: t.memberList.role,
      dataIndex: "role",
      key: "role",
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: t.memberList.status,
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "Active" ? "green" : "red"}>{v}</Tag>
      ),
    },
    {
      title: t.memberList.action,
      key: "action",
      render: (_: any, r: TeamMember) => (
        <Button type="link" onClick={() => navigate(`/members/${r.id}`)}>
          {t.memberList.edit}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Input
          placeholder={t.memberList.searchPlaceholder}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/members/new")}
        >
          {t.memberList.newMember}
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

export default MemberListPage;
