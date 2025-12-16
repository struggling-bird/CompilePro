import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Space } from "antd";
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
} from "@/services/metaprojects";

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

  return (
    <div
      style={{
        padding: "24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Input
            placeholder={t.projectList.searchPlaceholder}
            prefix={<SearchOutlined />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchText(e.target.value)
            }
            style={{ width: 200 }}
          />
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            {t.projectList.newProject}
          </Button>
        </Space>
      </div>

      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: 0,
          borderRadius: 8,
        }}
      >
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
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={setSelectedRowKeys}
            loading={loading}
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
