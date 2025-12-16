import React, { useState } from 'react';
import { Button, Card, List, Tag, Typography, Space } from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { SystemEnvironment } from '../../../types';
import { getSystemEnvironment } from '../../../services/system';

const { Text } = Typography;

const SystemCheck: React.FC = () => {
  const { t } = useLanguage();
  const [systemEnv, setSystemEnv] = useState<SystemEnvironment | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheckEnvironment = async () => {
    setChecking(true);
    try {
      const data = await getSystemEnvironment();
      setSystemEnv(data);
    } catch (error) {
      console.error('System check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Text strong className="text-lg">
          {t.settings.systemCheck}
        </Text>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={checking}
          onClick={handleCheckEnvironment}
        >
          {systemEnv ? t.settings.recheck : t.settings.checkEnvironment}
        </Button>
      </div>

      {!systemEnv && !checking && (
        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <ApiOutlined className="text-4xl mb-3" />
          <p>{t.settings.checkEnvironment}</p>
        </div>
      )}

      {systemEnv && (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={Object.values(systemEnv)}
          renderItem={(item: any) => (
            <List.Item>
              <Card size="small" className="shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Text strong className="text-base">
                        {item.name}
                      </Text>
                      {item.installed ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          {t.settings.installed}
                        </Tag>
                      ) : (
                        <Tag color="error" icon={<CloseCircleOutlined />}>
                          {t.settings.notInstalled}
                        </Tag>
                      )}
                    </div>
                    {item.installed && (
                      <div className="text-sm text-slate-500">
                        {t.settings.version}: <Text code>{item.version}</Text>
                      </div>
                    )}
                    {item.versionManager && (
                      <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                        <Space>
                          <Text type="secondary">
                            {t.settings.versionManager}:
                          </Text>
                          <Text strong>{item.versionManager.name}</Text>
                          {item.versionManager.installed ? (
                            <Tag color="blue" className="mr-0">
                              {t.settings.managerInstalled} (
                              {item.versionManager.version})
                            </Tag>
                          ) : (
                            <Tag color="warning" className="mr-0">
                              {t.settings.managerNotInstalled}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default SystemCheck;
