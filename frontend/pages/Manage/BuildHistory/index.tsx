import React from "react";
import { Table, Tag } from "antd";
import { MOCK_BUILD_HISTORY } from "../../../constants";

const BuildHistoryPage: React.FC = () => {
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Version", dataIndex: "version", key: "version" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Result",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Tag color={v === "success" ? "green" : "red"}>{v}</Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={MOCK_BUILD_HISTORY}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BuildHistoryPage;
