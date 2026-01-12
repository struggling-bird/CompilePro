import React, { useEffect, useState } from "react";
import { Modal, Form, Select } from "antd";
import { useLanguage } from "../../../../contexts/LanguageContext";
import {
  listProjects,
  getProjectDetail,
} from "../../../../services/metaprojects";

type ProjectOption = { value: string; label: string };
type VersionOption = { value: string; label: string };

interface AddModuleModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (payload: {
    projectId: string;
    projectName: string;
    versionId: string;
    versionName: string;
  }) => void;
}

const AddModuleModal: React.FC<AddModuleModalProps> = ({
  visible,
  onCancel,
  onAdd,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [versionOptions, setVersionOptions] = useState<VersionOption[]>([]);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedVersionName, setSelectedVersionName] = useState("");

  useEffect(() => {
    if (!visible) return;
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await listProjects({ page: 1, pageSize: 100 });
        setProjectOptions(
          (res.list || []).map((p) => ({ value: p.id, label: p.name }))
        );
      } catch (e) {
        // noop
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [visible]);

  const handleProjectChange = async (projectId: string, opt: any) => {
    setSelectedProjectName(opt?.label || "");
    form.setFieldsValue({ versionId: undefined });
    setVersionOptions([]);
    try {
      const detail = await getProjectDetail(projectId);
      setVersionOptions(
        (detail.versions || []).map((v) => ({ value: v.id, label: v.version }))
      );
    } catch (e) {
      // noop
    }
  };

  const handleVersionChange = (versionId: string, opt: any) => {
    setSelectedVersionName(opt?.label || "");
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    onAdd({
      projectId: values.projectId,
      projectName: selectedProjectName,
      versionId: values.versionId,
      versionName: selectedVersionName,
    });
  };

  return (
    <Modal
      title={t.templateDetail.addModuleTitle}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={t.templateDetail.add}
      cancelText={t.templateDetail.cancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="projectId"
          label={t.templateDetail.selectProject}
          rules={[{ required: true }]}
        >
          <Select
            loading={loadingProjects}
            options={projectOptions}
            placeholder={t.templateDetail.selectProject}
            onChange={handleProjectChange}
            showSearch
          />
        </Form.Item>
        <Form.Item
          name="versionId"
          label={t.templateDetail.selectVersion}
          rules={[{ required: true }]}
        >
          <Select
            options={versionOptions}
            placeholder={t.templateDetail.selectVersion}
            onChange={handleVersionChange}
            showSearch
            disabled={versionOptions.length === 0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddModuleModal;

