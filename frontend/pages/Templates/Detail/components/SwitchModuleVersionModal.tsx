import React, { useEffect, useState } from "react";
import { Modal, Form, Select } from "antd";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { getProjectDetail } from "../../../../services/metaprojects";

type VersionOption = { value: string; label: string };

interface SwitchModuleVersionModalProps {
  visible: boolean;
  projectId: string;
  currentVersionName?: string;
  onCancel: () => void;
  onSwitch: (payload: { versionId: string; versionName: string }) => void;
}

const SwitchModuleVersionModal: React.FC<SwitchModuleVersionModalProps> = ({
  visible,
  projectId,
  currentVersionName,
  onCancel,
  onSwitch,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [versionOptions, setVersionOptions] = useState<VersionOption[]>([]);
  const [selectedVersionName, setSelectedVersionName] = useState<string>(
    currentVersionName || ""
  );

  useEffect(() => {
    if (!visible || !projectId) return;
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const detail = await getProjectDetail(projectId);
        const opts = (detail.versions || []).map((v) => ({
          value: v.id,
          label: v.version,
        }));
        setVersionOptions(opts);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [visible, projectId]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSwitch({ versionId: values.versionId, versionName: selectedVersionName });
  };

  return (
    <Modal
      title={t.templateDetail.selectVersion}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={t.templateDetail.save}
      cancelText={t.templateDetail.cancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="versionId"
          label={t.templateDetail.selectVersion}
          rules={[{ required: true }]}
        >
          <Select
            loading={loading}
            options={versionOptions}
            placeholder={t.templateDetail.selectVersion}
            onChange={(_, opt: any) => setSelectedVersionName(opt?.label || "")}
            showSearch
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SwitchModuleVersionModal;

