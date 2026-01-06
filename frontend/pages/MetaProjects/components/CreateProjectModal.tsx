import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Radio, Select, message } from "antd";
import { useLanguage } from "@/contexts/LanguageContext";
import { listBranches, listTags } from "@/services/metaprojects";

interface CreateProjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreate: (values: {
    name: string;
    gitUrl: string;
    version: string;
    sourceType: "branch" | "tag";
    refName: string;
    description?: string;
  }) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onCancel,
  onCreate,
}) => {
  const [form] = Form.useForm();
  const { t } = useLanguage();
  const sourceType = Form.useWatch("sourceType", form);
  const gitUrl = Form.useWatch("gitUrl", form);
  const [refOptions, setRefOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const loadRefs = async () => {
    const type = sourceType;
    const repo = (gitUrl || "").trim();
    if (!type) return;
    if (!repo) {
      setRefOptions([]);
      message.warning("请先填写 Git 地址");
      return;
    }
    try {
      setLoadingRefs(true);
      const data =
        type === "tag" ? await listTags(repo) : await listBranches(repo);
      const opts = (data.list ?? []).map((i) => ({
        label: i.name,
        value: i.name,
      }));
      setRefOptions(opts);
    } finally {
      setLoadingRefs(false);
    }
  };

  useEffect(() => {
    setRefOptions([]);
    form.setFieldsValue({ refName: undefined });
    if (sourceType) loadRefs();
  }, [sourceType, gitUrl]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={t.projectList.createProjectTitle}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t.projectList.createBtn}
      cancelText={t.projectDetail.cancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t.projectList.projectName}
          rules={[{ required: true, message: "Please input project name!" }]}
        >
          <Input placeholder={t.projectList.projectPlaceholder} />
        </Form.Item>
        <Form.Item
          name="gitUrl"
          label={t.projectDetail.gitRepo}
          rules={[
            { required: true, message: "请输入Git地址" },
            {
              pattern: /(^https?:\/\/|^git@|^ssh:\/\/|^git:\/\/)/i,
              message: "Git地址格式不正确",
            },
          ]}
        >
          <Input placeholder="例如：https://github.com/org/repo.git" />
        </Form.Item>
        <Form.Item
          name="version"
          label={t.projectList.initialVersion}
          rules={[{ required: true, message: "Please input initial version!" }]}
        >
          <Input placeholder={t.projectList.versionPlaceholder} />
        </Form.Item>
        <Form.Item
          name="sourceType"
          label={t.projectDetail.versionType}
          rules={[{ required: true, message: "请选择来源类型" }]}
        >
          <Radio.Group>
            <Radio value="branch">{t.projectDetail.branch}</Radio>
            <Radio value="tag">{t.projectDetail.tag}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="refName"
          label={
            sourceType === "tag" ? t.projectDetail.tag : t.projectDetail.branch
          }
          rules={[{ required: true, message: "请选择分支或标签" }]}
        >
          <Select
            placeholder={sourceType === "tag" ? "选择标签" : "选择分支"}
            options={refOptions}
            loading={loadingRefs}
            showSearch
            allowClear
            onFocus={() => loadRefs()}
          />
        </Form.Item>
        <Form.Item name="description" label={t.projectDetail.description}>
          <Input.TextArea placeholder="项目描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
