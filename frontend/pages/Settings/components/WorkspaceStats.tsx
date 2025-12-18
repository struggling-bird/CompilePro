import React, { useEffect, useState } from 'react';
import { Card, Statistic, Button, Spin, Typography } from 'antd';
import { ReloadOutlined, DatabaseOutlined, FolderOpenOutlined, TeamOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getWorkspaceStats, WorkspaceStats as IWorkspaceStats } from '../../../services/workspace';

const { Text } = Typography;

const WorkspaceStats: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<IWorkspaceStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getWorkspaceStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch workspace stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={t.settings.rootPath}
              value={stats.root}
              prefix={<FolderOpenOutlined />}
              valueStyle={{ fontSize: '16px', wordBreak: 'break-all' }}
            />
          </Card>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={t.settings.userCount}
              value={stats.users}
              prefix={<TeamOutlined />}
            />
          </Card>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={t.settings.totalSize}
              value={formatBytes(stats.size)}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default WorkspaceStats;
