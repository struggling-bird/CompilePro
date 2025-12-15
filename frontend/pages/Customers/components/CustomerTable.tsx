import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import type { Customer } from "../../../types";
import { Table, Tag, Button } from "antd";

type Props = {
  customers: Customer[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManageEnvironments: (id: string) => void;
};

const CustomerTable: React.FC<Props> = ({
  customers,
  loading,
  onEdit,
  onDelete,
  onManageEnvironments,
}) => {
  const { t } = useLanguage();
  const columns = [
    { title: t.customerList.name, dataIndex: "name", key: "name" },
    {
      title: t.customerList.contact,
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    { title: t.customerList.phone, dataIndex: "phone", key: "phone" },
    { title: t.customerList.email, dataIndex: "email", key: "email" },
    {
      title: t.customerList.status,
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "Active" ? "green" : "red"}>
          {v === "Active"
            ? t.customerDetail.statusActive
            : t.customerDetail.statusInactive}
        </Tag>
      ),
    },
    {
      title: t.customerList.action,
      key: "action",
      render: (_: any, record: Customer) => (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="link" onClick={() => onManageEnvironments(record.id)}>
            {t.customerList.environments}
          </Button>
          <Button type="link" onClick={() => onEdit(record.id)}>
            {t.customerList.edit}
          </Button>
          <Button type="link" danger onClick={() => onDelete(record.id)}>
            {t.customerList.delete}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={customers}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default CustomerTable;
