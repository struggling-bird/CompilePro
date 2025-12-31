import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Space, Popconfirm, message } from "antd";
import {
  PlusOutlined,
  SettingOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProjectTable from "../components/ProjectTable";
import CreateProjectModal from "../components/CreateProjectModal";
import { Project } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  listProjects,
  createProject,
  createVersion,
  deleteProject,
} from "@/services/metaprojects";
import styles from "../styles/List.module.less";

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchList = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await listProjects({
        page,
        pageSize,
        q: searchText.trim() || undefined,
      });
      const mapped: Project[] = (res.list ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        latestVersion: p.latestVersion?.version ?? "",
        readmeUrl: "#",
        buildDocUrl: "#",
        gitRepo: p.gitUrl,
        description: p.description ?? "",
        versions: [],
      }));
      setProjects(mapped);
    } catch (err: any) {
      const msg = err?.message || "加载失败";
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleCreate = async (values: {
    name: string;
    gitUrl: string;
    version: string;
    sourceType: "branch" | "tag";
    refName: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      await createProject({
        name: values.name,
        gitUrl: values.gitUrl,
        description: values.description,
        initialVersion: values.version,
        sourceType: values.sourceType,
        sourceValue: values.refName,
        summary: values.description,
      });
      await fetchList();
      setIsModalOpen(false);
    } catch (e) {
      // ignore here, UI 将在服务层抛错后由 message 捕获
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p: Project) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDeleteOne = async (id: string) => {
    try {
      await deleteProject(id);
      message.success(t.common?.success || "删除成功");
      fetchList();
    } catch (err: any) {
      message.error(err?.message || "删除失败");
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedRowKeys.length) return;
    try {
      await Promise.all(selectedRowKeys.map((id) => deleteProject(String(id))));
      message.success(t.common?.success || "删除成功");
      setSelectedRowKeys([]);
      fetchList();
    } catch (err: any) {
      message.error(err?.message || "删除失败");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Input
            placeholder={t.projectList.searchPlaceholder}
            prefix={
              <SearchOutlined style={{ color: "var(--color-slate-400)" }} />
            }
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchList}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchList}>
            {t.settings?.refresh || "刷新"}
          </Button>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{ backgroundColor: "var(--color-blue-600)" }}
          >
            {t.projectList.newProject}
          </Button>
          <Popconfirm
            title={
              t.projectList.deleteConfirm ||
              "确认删除选中的项目及其工作空间文件？"
            }
            onConfirm={handleBatchDelete}
            okText={t.templateDetail?.yes || "确定"}
            cancelText={t.templateDetail?.no || "取消"}
          >
            <Button danger disabled={!selectedRowKeys.length}>
              {t.projectDetail?.delete || "删除"}
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <div className={styles.tableContainer}>
        {loadError ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Space direction="vertical">
              <div style={{ color: "#ff4d4f" }}>{loadError}</div>
              <Button
                type="primary"
                onClick={fetchList}
                icon={<ReloadOutlined />}
              >
                重新加载
              </Button>
            </Space>
          </div>
        ) : (
          <ProjectTable
            projects={filteredProjects}
            loading={loading}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
            onDelete={handleDeleteOne}
          />
        )}
      </div>

      <CreateProjectModal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ProjectList;
