import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table, Spin } from "antd";
import { Pie, Area } from "@ant-design/plots";
import {
  getStorageTrends,
  getFileTypeDistribution,
  getHotFiles,
  StorageTrend,
  FileTypeStat,
  HotFile,
} from "../../../../services/storageAnalysis";
import { useLanguage } from "../../../../contexts/LanguageContext";

const StorageOverview: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<StorageTrend[]>([]);
  const [types, setTypes] = useState<FileTypeStat[]>([]);
  const [hotFiles, setHotFiles] = useState<HotFile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendsData, typesData, hotFilesData] = await Promise.all([
          getStorageTrends(),
          getFileTypeDistribution(),
          getHotFiles(),
        ]);
        setTrends(trendsData);
        setTypes(typesData);
        setHotFiles(hotFilesData);
      } catch (error) {
        console.error("Failed to fetch storage analysis data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hotFilesColumns = [
    {
      title: t.settings.fileName,
      dataIndex: "name",
      key: "name",
    },
    {
      title: t.settings.filePath,
      dataIndex: "path",
      key: "path",
      ellipsis: true,
    },
    {
      title: t.settings.fileSize,
      dataIndex: "size",
      key: "size",
      render: (val: number) => formatBytes(val),
    },
    {
      title: t.settings.accessCount,
      dataIndex: "accessCount",
      key: "accessCount",
      sorter: (a: HotFile, b: HotFile) => a.accessCount - b.accessCount,
    },
    {
      title: t.settings.lastAccessed,
      dataIndex: "lastAccessed",
      key: "lastAccessed",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title={t.settings.storageGrowthTrend} className="shadow-sm">
            <div style={{ height: 300 }}>
              <Area
                {...({
                  data: trends,
                  xField: "date",
                  yField: "size",
                  color: "#1890ff",
                  areaStyle: { fillOpacity: 0.2 },
                } as any)}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t.settings.fileTypeDistribution} className="shadow-sm">
            <div style={{ height: 300 }}>
              <Pie
                {...({
                  data: types,
                  angleField: "size",
                  colorField: "type",
                  radius: 0.8,
                  label: {
                    text: (d: any) => `${d.type}\n${d.size.toFixed(1)}MB`,
                    position: "outside",
                  },
                  interactions: [{ type: "element-active" }],
                } as any)}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Card title={t.settings.hotFilesAccess} className="shadow-sm">
        <Table
          dataSource={hotFiles}
          columns={hotFilesColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default StorageOverview;
