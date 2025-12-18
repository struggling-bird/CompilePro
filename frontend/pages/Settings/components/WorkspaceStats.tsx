import React, { useEffect, useState } from "react";
import {
  Card,
  Statistic,
  Button,
  Spin,
  Typography,
  Table,
  Row,
  Col,
} from "antd";
import {
  ReloadOutlined,
  DatabaseOutlined,
  FolderOpenOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  getWorkspaceStatsDetail,
  WorkspaceStatsDetail,
  UserSpaceStats,
} from "../../../services/system";
import { Pie, Column } from "@ant-design/plots";

const { Text } = Typography;

const WorkspaceStats: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<WorkspaceStatsDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getWorkspaceStatsDetail();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch workspace stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const expandedRowRender = (record: UserSpaceStats) => {
    const columns = [
      { title: t.settings.projectName, dataIndex: "name", key: "name" },
      {
        title: t.settings.projectDesc,
        dataIndex: "description",
        key: "description",
      },
      {
        title: t.settings.sizeColumn,
        dataIndex: "size",
        key: "size",
        render: (val: number) => formatBytes(val),
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={record.projects}
        pagination={false}
        rowKey="id"
      />
    );
  };

  const columns = [
    {
      title: t.settings.usernameColumn,
      dataIndex: "username",
      key: "username",
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: t.settings.projectCountColumn,
      dataIndex: "projectCount",
      key: "projectCount",
    },
    {
      title: t.settings.sizeColumn,
      dataIndex: "size",
      key: "size",
      render: (val: number) => formatBytes(val),
      sorter: (a: UserSpaceStats, b: UserSpaceStats) => a.size - b.size,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Text strong className="text-lg">
          {t.settings.workspaceStats}
        </Text>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={fetchStats}
        >
          {t.settings.refresh}
        </Button>
      </div>

      {loading && !stats ? (
        <div className="text-center py-12">
          <Spin size="large" />
        </div>
      ) : stats ? (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Card
                className="shadow-sm"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <Statistic
                  title={t.settings.totalUsers || "Total Users"}
                  value={stats.totalUsers}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                className="shadow-sm"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <Statistic
                  title={t.settings.totalProjects || "Total Projects"}
                  value={stats.totalProjects}
                  prefix={<FolderOpenOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card
                className="shadow-sm"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <Statistic
                  title={t.settings.totalSize}
                  value={formatBytes(stats.totalSize)}
                  prefix={<DatabaseOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <Card
                title={t.settings.storageDistribution}
                className="shadow-sm"
                styles={{ body: { padding: "24px" } }}
              >
                <div style={{ height: 300 }}>
                  <Pie
                    data={stats.userSpaces}
                    angleField="size"
                    colorField="username"
                    radius={0.8}
                    label={{
                      text: (d: any) => `${d.username}: ${formatBytes(d.size)}`,
                      position: "outside",
                    }}
                    tooltip={{
                      title: "username",
                      items: [
                        {
                          channel: "y",
                          valueFormatter: (v: number) => formatBytes(v),
                        },
                      ],
                    }}
                  />
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={t.settings.projectCountDistribution}
                className="shadow-sm"
                styles={{ body: { padding: "24px" } }}
              >
                <div style={{ height: 300 }}>
                  <Column
                    data={stats.userSpaces}
                    xField="username"
                    yField="projectCount"
                    color="#82ca9d"
                    label={{
                      position: "inside",
                      style: {
                        fill: "#FFFFFF",
                        opacity: 0.6,
                      },
                    }}
                    meta={{
                      username: { alias: t.settings.usernameColumn },
                      projectCount: { alias: t.settings.projectCountColumn },
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          <Card title={t.settings.details} className="shadow-sm mt-4">
            <Table
              columns={columns}
              expandable={{ expandedRowRender }}
              dataSource={stats.userSpaces}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default WorkspaceStats;
