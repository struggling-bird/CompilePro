import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { TemplateVersion } from "../../../../types";

interface VersionCreationModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreate: (values: VersionCreationValues) => void;
  versions: TemplateVersion[];
  currentVersionId: string;
}

export interface VersionCreationValues {
  parentVersionId: string;
  versionType: "Major" | "Minor" | "Patch" | "Hotfix" | "Branch";
  version: string;
  description: string;
}

const VersionCreationModal: React.FC<VersionCreationModalProps> = ({
  visible,
  onCancel,
  onCreate,
  versions,
  currentVersionId,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [selectedParentId, setSelectedParentId] =
    useState<string>(currentVersionId);
  const [selectedType, setSelectedType] =
    useState<VersionCreationValues["versionType"]>("Patch");

  // Effect to update parent ID when prop changes or modal opens
  useEffect(() => {
    if (visible) {
      const initialParent =
        currentVersionId ||
        (versions.length > 0 ? versions[versions.length - 1].id : "");
      setSelectedParentId(initialParent);
      form.setFieldsValue({
        parentVersionId: initialParent,
        versionType: "Patch",
        description: "",
      });
      calculateVersion(initialParent, "Patch");
    }
  }, [visible, currentVersionId, versions]);

  const calculateVersion = (
    parentId: string,
    type: VersionCreationValues["versionType"]
  ) => {
    const parent = versions.find((v) => v.id === parentId);
    if (!parent) return;

    let newVer = "";

    if (parent.isBranch) {
      // Handle branch version increment: keep base branch name, increment suffix
      // e.g., 1.1.0-branch -> 1.1.0-branch.1
      // e.g., 1.1.0-branch.1 -> 1.1.0-branch.2

      // Regex to match "base-suffix.number" or "base-suffix"
      // Try to find the last numeric part
      const lastDotIndex = parent.version.lastIndexOf(".");
      const lastPart = parent.version.substring(lastDotIndex + 1);

      if (/^\d+$/.test(lastPart) && lastDotIndex !== -1) {
        // It ends with a number, increment it
        const num = parseInt(lastPart);
        const prefix = parent.version.substring(0, lastDotIndex);
        // Check if the prefix itself looks like a semantic version (x.y.z)
        // If parent is 1.0.0, last part is 0, prefix is 1.0.
        // Wait, standard semver is x.y.z.
        // If parent is "1.1.0-branch", last part is "branch" (NaN).
        // If parent is "1.1.0-branch.1", last part is "1".

        // We need to be careful not to increment patch version of semver if it's not a branch suffix.
        // But here parent.isBranch is true.
        // Let's assume branch version format is always "something-branchname" or "something-branchname.N"

        // A safer heuristic: does it look like a prerelease/build number?
        // If type is "Branch", we append/increment suffix.
        // If type is "Major"/"Minor"/"Patch" on a branch? usually invalid or means merging back?
        // User request says: "generated version number should be based on baseline version number increment"
        // "like 1.1.0-branch -> 1.1.0-branch.1"

        newVer = `${prefix}.${num + 1}`;
      } else {
        // No numeric suffix, append .1
        newVer = `${parent.version}.1`;
      }

      // If user explicitly selects "Major"/"Minor" on a branch, maybe we should warn or reset?
      // But for now, let's strictly follow the user's specific request for branch behavior:
      // "支线的原始版本号部分是不变的"
      // This implies we ignore the 'type' (Major/Minor/Patch) logic if it's a branch?
      // Or maybe 'Patch' means increment the suffix?

      // Let's implement the specific request logic:
      // If parent is branch, just increment the suffix regardless of type (or map type to suffix increment)
      // But if type is 'Branch', maybe create a sub-branch?
      // The user example "1.1.0-branch -> 1.1.0-branch.1" corresponds to a "Patch" or "Minor" update on that branch?
      // Let's assume standard behavior for now: if parent is branch, we are releasing a new version ON that branch.
    } else {
      // Standard SemVer logic for non-branch parents
      const versionParts = parent.version.split(/[-.]/);
      const major = parseInt(versionParts[0]) || 0;
      const minor = parseInt(versionParts[1]) || 0;
      const patch = parseInt(versionParts[2]) || 0;

      switch (type) {
        case "Major":
          newVer = `${major + 1}.0.0`;
          break;
        case "Minor":
          newVer = `${major}.${minor + 1}.0`;
          break;
        case "Patch":
          newVer = `${major}.${minor}.${patch + 1}`;
          break;
        case "Hotfix":
          newVer = `${major}.${minor}.${patch + 1}-hotfix`;
          break;
        case "Branch":
          newVer = `${parent.version}-branch`;
          break;
        default:
          newVer = parent.version;
      }
    }
    form.setFieldsValue({ version: newVer });
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.parentVersionId) {
      setSelectedParentId(changedValues.parentVersionId);
      calculateVersion(changedValues.parentVersionId, allValues.versionType);
    }
    if (changedValues.versionType) {
      setSelectedType(changedValues.versionType);
      calculateVersion(allValues.parentVersionId, changedValues.versionType);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={t.templateDetail.newVersion}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item
          name="parentVersionId"
          label={t.templateDetail.parentVersion}
          rules={[{ required: true }]}
        >
          <Select>
            {versions.map((v) => (
              <Select.Option key={v.id} value={v.id}>
                {v.version} {v.isBranch ? "(Branch)" : ""}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="versionType"
          label={t.templateDetail.versionType}
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="Major">
              {t.templateDetail.types.Major}
            </Select.Option>
            <Select.Option value="Minor">
              {t.templateDetail.types.Minor}
            </Select.Option>
            <Select.Option value="Patch">
              {t.templateDetail.types.Patch}
            </Select.Option>
            <Select.Option value="Hotfix">
              {t.templateDetail.types.Hotfix}
            </Select.Option>
            <Select.Option value="Branch">
              {t.templateDetail.types.Branch}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="version"
          label={t.templateDetail.versionNumber}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label={t.templateDetail.versionDesc}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VersionCreationModal;
