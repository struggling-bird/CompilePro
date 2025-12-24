import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, Button, Tabs, message, Typography, Space } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  BuildOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import GlobalConfigTable from "./components/GlobalConfigTable";
import MetaProjectTabs from "./components/MetaProjectTabs";
import VersionTimeline from "./components/VersionTimeline";
import { ProjectTemplate, TemplateVersion } from "../../../types";
import dayjs from "dayjs";

const { Text } = Typography;

// Mock Data
const MOCK_TEMPLATE_DATA: ProjectTemplate = {
  id: "t1",
  name: "私有部署标准版",
  latestVersion: "1.1.0",
  versions: [
    {
      id: "v1",
      version: "1.0.0",
      date: "2019.02.18",
      status: "Active",
      globalConfigs: [
        {
          id: "g1",
          name: "域名",
          type: "TEXT",
          defaultValue: "https://zhugeio.com/",
          description: "分析平台网站主域名",
          isHidden: false,
        },
      ],
      modules: [
        {
          id: "m1",
          projectId: "p1",
          projectName: "webapp",
          projectVersion: "1.0.0",
          publishMethod: "GIT",
          configs: [
            {
              id: "c1",
              name: "域名",
              fileLocation: "/config.js",
              mappingType: "GLOBAL",
              mappingValue: "g1",
              regex: "/origin/",
              description: "分析平台网站主域名",
              isHidden: true,
              isSelected: true,
            },
          ],
        },
      ],
    },
    {
      id: "v2",
      version: "1.1.0",
      date: "2023.10.27",
      status: "Active",
      globalConfigs: [
        {
          id: "g1",
          name: "域名",
          type: "TEXT",
          defaultValue: "https://zhugeio.com/",
          description: "分析平台网站主域名",
          isHidden: false,
        },
        {
          id: "g2",
          name: "Logo",
          type: "FILE",
          defaultValue: "images/logo.png",
          description: "Logo文件替换",
          isHidden: true,
        },
      ],
      modules: [
        {
          id: "m1",
          projectId: "p1",
          projectName: "webapp",
          projectVersion: "1.1.0",
          publishMethod: "GIT",
          configs: [],
        },
      ],
    },
  ],
};

const TemplateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isNew = !templateId || templateId === "new";
  const { t } = useLanguage();
  const [form] = Form.useForm();

  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string>("");

  // Initialize Data
  useEffect(() => {
    if (isNew) {
      // Init empty template
      const initialVersionId = "v_init";
      const initialVersion: TemplateVersion = {
        id: initialVersionId,
        version: "1.0.0",
        date: dayjs().format("YYYY.MM.DD"),
        status: "Active",
        globalConfigs: [],
        modules: [],
      };
      setTemplate({
        id: "",
        name: "",
        latestVersion: "1.0.0",
        versions: [initialVersion],
      });
      setCurrentVersionId(initialVersionId);
    } else {
      // Load existing template (Mock)
      setTemplate(MOCK_TEMPLATE_DATA);
      const latest =
        MOCK_TEMPLATE_DATA.versions[MOCK_TEMPLATE_DATA.versions.length - 1];
      setCurrentVersionId(latest.id);
      form.setFieldsValue({ name: MOCK_TEMPLATE_DATA.name });
    }
  }, [isNew, templateId]);

  const currentVersion = useMemo(() => {
    return template?.versions.find((v) => v.id === currentVersionId);
  }, [template, currentVersionId]);

  const handleUpdateVersionData = (key: keyof TemplateVersion, value: any) => {
    if (!template || !currentVersionId) return;
    setTemplate((prev) => {
      if (!prev) return null;
      const newVersions = prev.versions.map((v) =>
        v.id === currentVersionId ? { ...v, [key]: value } : v
      );
      return { ...prev, versions: newVersions };
    });
  };

  const handleAddVersion = () => {
    if (!template) return;
    const lastVersion = template.versions[template.versions.length - 1];
    const newVerStr = lastVersion
      ? incrementVersion(lastVersion.version)
      : "1.0.0";

    const newVersion: TemplateVersion = {
      id: Date.now().toString(),
      version: newVerStr,
      date: dayjs().format("YYYY.MM.DD"),
      status: "Active",
      globalConfigs: lastVersion ? [...lastVersion.globalConfigs] : [],
      modules: lastVersion
        ? JSON.parse(JSON.stringify(lastVersion.modules))
        : [],
    };

    setTemplate((prev) => ({
      ...prev!,
      versions: [...prev!.versions, newVersion],
    }));
    setCurrentVersionId(newVersion.id);
    message.success("已添加新版本");
  };

  const incrementVersion = (v: string) => {
    const parts = v.split(".").map(Number);
    if (parts.length === 3) {
      parts[2]++;
      return parts.join(".");
    }
    return v + ".1";
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...template,
        name: values.name,
      };
      console.log("Saving template:", payload);
      message.success("保存成功");
      navigate("/templates");
    } catch (e) {
      console.error(e);
    }
  };

  if (!template || !currentVersion) return <div>Loading...</div>;

import styles from "../styles/Detail.module.less";

const TemplateDetailPage: React.FC = () => {
  // ... existing code ...

  return (
    <div className={styles.container}>
      {/* Top Navigation Bar */}
      <div className={styles.header}>
        <Space size="middle">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/templates")}
          >
            返回
          </Button>
          <div className={styles.headerInfo}>
            <span className={styles.headerLabel}>名称:</span>
            <Form form={form} layout="inline">
              <Form.Item
                name="name"
                style={{ margin: 0 }}
                rules={[{ required: true }]}
              >
                <Input
                  placeholder="模板名称"
                  style={{ width: 300, fontWeight: 500 }}
                />
              </Form.Item>
            </Form>
            <span className={styles.headerLabel}>v:{currentVersion.version}</span>
          </div>
        </Space>
        <Space>
          <Button icon={<BuildOutlined />}>编译</Button>
          <Button icon={<SettingOutlined />}>管理</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存设置
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        {/* Global Config */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <Text strong style={{ fontSize: 16 }}>
              全局配置 :
            </Text>
          </div>
          <GlobalConfigTable
            value={currentVersion.globalConfigs}
            onChange={(val) => handleUpdateVersionData("globalConfigs", val)}
          />
        </div>

        {/* Meta Projects */}
        <div className={styles.sectionNoPadding}>
          <MetaProjectTabs
            modules={currentVersion.modules}
            onChange={(val) => handleUpdateVersionData("modules", val)}
            globalConfigs={currentVersion.globalConfigs}
          />
        </div>

        {/* Version Record */}
        <div className={styles.section}>
          <div className="mb-2">
            <Text strong style={{ fontSize: 16 }}>
              版本记录 ——
            </Text>
          </div>
          <VersionTimeline
            versions={template.versions}
            currentVersionId={currentVersionId}
            onChange={setCurrentVersionId}
            onAddVersion={handleAddVersion}
            onDeleteVersion={(id) => {
              const newVersions = template.versions.filter((v) => v.id !== id);
              setTemplate({ ...template, versions: newVersions });
              if (currentVersionId === id && newVersions.length > 0) {
                setCurrentVersionId(newVersions[newVersions.length - 1].id);
              }
            }}
            onDeprecateVersion={(id) => {
              const newVersions = template.versions.map((v) =>
                v.id === id ? { ...v, status: "Deprecated" as const } : v
              );
              setTemplate({ ...template, versions: newVersions });
            }}
            onBranchVersion={(id) => {
              const version = template.versions.find((v) => v.id === id);
              if (!version) return;

              const newVersion: TemplateVersion = {
                id: Date.now().toString(),
                version: `${version.version}-b1`,
                date: dayjs().format("YYYY.MM.DD"),
                status: "Active",
                isBranch: true,
                baseVersion: version.version,
                globalConfigs: [...version.globalConfigs],
                modules: JSON.parse(JSON.stringify(version.modules)),
              };

              setTemplate((prev) => ({
                ...prev!,
                versions: [...prev!.versions, newVersion],
              }));
              setCurrentVersionId(newVersion.id);
              message.success("已创建分支版本");
            }}
          />

          {/* Info Note */}
          <div className={styles.infoNote}>
            <p>增加子分支后，子分支可以修改、增加配置项。不能删除项。</p>
            <p>
              后续子分支可以rebase到主分支。也支持合并到主分支。更新或者合并后的配置项，标记出来变动的部分。方便知道子分支增加了哪些配置项。
            </p>
          </div>
        </div>

        {/* Documentation Tabs */}
        <div className={styles.section}>
          <Tabs
            items={[
              {
                label: "README",
                key: "readme",
                children: (
                  <div className={styles.tabContent}>
                    <Input.TextArea
                      rows={8}
                      placeholder="说明文档..."
                      style={{ resize: "none" }}
                    />
                    <p className={styles.tabHint}>
                      时间轴上可以切换查看不同的版本，下方的说明文档、部署文档、更新文档都会自动切换。
                    </p>
                  </div>
                ),
              },
              {
                label: "BUILD",
                key: "build",
                children: <Input.TextArea rows={8} placeholder="编译说明..." />,
              },
              {
                label: "UPDATE",
                key: "update",
                children: <Input.TextArea rows={8} placeholder="更新日志..." />,
              },
            ]}
            type="card"
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailPage;
