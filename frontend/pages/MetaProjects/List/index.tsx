import React, { useState } from "react";
import { Button, Input, Space } from "antd";
import {
  PlusOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProjectTable from "../components/ProjectTable";
import CreateProjectModal from "../components/CreateProjectModal";
import { MOCK_PROJECTS } from "@/constants";
import { Project } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleCreate = (values: {
    name: string;
    gitRepo: string;
    version: string;
    sourceType: "branch" | "tag";
    refName: string;
    description?: string;
  }) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: values.name,
      latestVersion: values.version,
      readmeUrl: "#",
      buildDocUrl: "#",
      gitRepo: values.gitRepo,
      description: values.description,
      versions: [
        {
          id: `v-${Date.now()}`,
          version: values.version,
          date: "Today",
          type: values.sourceType,
          ref: values.refName,
        },
      ],
    };
    setProjects([...projects, newProject]);
    setIsModalOpen(false);
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
        <ProjectTable
          projects={filteredProjects}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
        />
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
