import React from "react";
import { Table, Button, Space, Typography } from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  BuildOutlined,
} from "@ant-design/icons";
import { Project } from "@/types";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./ProjectTable.module.less";

const { Text } = Typography;

interface ProjectTableProps {
  projects: Project[];
  loading?: boolean;
  selectedRowKeys: React.Key[];
  onSelectionChange: (selectedRowKeys: React.Key[]) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  loading,
  selectedRowKeys,
  onSelectionChange,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const columns = [
    {
      title: t.projectList.projectName,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t.projectList.latestVersion,
      dataIndex: "latestVersion",
      key: "latestVersion",
    },
    {
      title: t.projectList.docs,
      key: "readme",
      render: () => (
        <Space>
          <FileTextOutlined className={styles.docIcon} />
          <a href="#" className={styles.docLink}>
            README.md
          </a>
        </Space>
      ),
    },
    {
      title: t.projectList.buildDoc,
      key: "buildDoc",
      render: () => (
        <Space>
          <BuildOutlined className={styles.docIcon} />
          <a href="#" className={styles.docLink}>
            BUILD.md
          </a>
        </Space>
      ),
    },
    {
      title: t.projectList.action,
      key: "action",
      render: (_: any, record: Project) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => navigate(`/meta-projects/${record.id}`)}
        >
          {t.projectList.edit}
        </Button>
      ),
      align: "right" as const,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectionChange,
  };

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={projects}
      loading={loading}
      rowSelection={rowSelection}
      pagination={false}
    />
  );
};

export default ProjectTable;
