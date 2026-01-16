import React, { useState, useEffect } from "react";
/**
 * VersionCreationModal Component
 *
 * A modal form for creating new versions (Major, Minor, Patch, Hotfix, Branch).
 *
 * Props:
 * @param visible - Whether the modal is visible
 * @param onCancel - Handler for cancellation
 * @param onCreate - Handler for form submission, receives VersionCreationValues
 * @param versions - List of existing versions for parent selection and validation
 * @param currentVersionId - The ID of the current context version
 * @param isParentTerminal - Logic to determine if the parent version allows creating specific types
 * @param initialVersionFormItems - Optional ReactNode to render extra fields when creating the first version (e.g. Project Name)
 */
import { Modal, Form, Input, Select, Space } from "antd";
import { useLanguage } from "../../contexts/LanguageContext";
import { VersionNode, VersionCreationValues } from "./types";

interface VersionCreationModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreate: (values: VersionCreationValues) => void;
  versions: VersionNode[];
  currentVersionId: string;
  isParentTerminal?: boolean;
  // Content to render for initial version (e.g. Template Name)
  initialVersionFormItems?: React.ReactNode;
}

const VersionCreationModal: React.FC<VersionCreationModalProps> = ({
  visible,
  onCancel,
  onCreate,
  versions,
  currentVersionId,
  isParentTerminal = true,
  initialVersionFormItems,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] =
    useState<VersionCreationValues["versionType"]>("Patch");
  const [branchSuffix, setBranchSuffix] = useState<string>("branch");
  const [baseVersionPrefix, setBaseVersionPrefix] = useState<string>("");

  const isInitialVersion = versions.length === 0;

  // Effect to update parent ID when prop changes or modal opens
  useEffect(() => {
    if (visible) {
      if (isInitialVersion) {
        form.setFieldsValue({
          parentVersionId: undefined,
          versionType: "Major",
          version: "1.0.0",
          description: "Initial version",
          // Reset other fields if any
        });
      } else {
        const initialParent =
          currentVersionId ||
          (versions.length > 0 ? versions[versions.length - 1].id : "");

        const defaultType = isParentTerminal ? "Patch" : "Branch";
        setSelectedType(defaultType);

        form.setFieldsValue({
          parentVersionId: initialParent,
          versionType: defaultType,
          description: "",
        });
        calculateVersion(initialParent, defaultType);
      }
    }
  }, [visible, currentVersionId, versions, isInitialVersion, isParentTerminal]);

  // Update full version string when suffix changes (only for Branch type)
  useEffect(() => {
    if (selectedType === "Branch" && baseVersionPrefix) {
      const fullVersion = `${baseVersionPrefix}-${branchSuffix}`;
      form.setFieldsValue({ version: fullVersion });
    }
  }, [branchSuffix, selectedType, baseVersionPrefix]);

  const calculateVersion = (
    parentId: string,
    type: VersionCreationValues["versionType"]
  ) => {
    if (isInitialVersion) return;
    const parent = versions.find((v) => v.id === parentId);
    if (!parent) return;

    let newVer = "";

    // Reset base prefix
    setBaseVersionPrefix(parent.version);

    if (type === "Branch") {
      // New Branch Logic
      setBaseVersionPrefix(parent.version);
      setBranchSuffix("branch"); // Default suffix
      newVer = `${parent.version}-branch`;
    } else {
      // Standard SemVer logic for non-branch parents (or incrementing existing branch)
      const versionParts = parent.version.split(/[-.]/);
      const major = parseInt(versionParts[0]) || 0;
      const minor = parseInt(versionParts[1]) || 0;
      const patch = parseInt(versionParts[2]) || 0;

      if (parent.isBranch) {
        // Heuristic for branch increment
        const lastDotIndex = parent.version.lastIndexOf(".");
        const lastPart = parent.version.substring(lastDotIndex + 1);
        if (/^\d+$/.test(lastPart) && lastDotIndex !== -1) {
          const num = parseInt(lastPart);
          const prefix = parent.version.substring(0, lastDotIndex);
          newVer = `${prefix}.${num + 1}`;
        } else {
          newVer = `${parent.version}.1`;
        }
      } else {
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
          default:
            newVer = parent.version;
        }
      }
    }

    form.setFieldsValue({ version: newVer });
  };

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.parentVersionId) {
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
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} autoComplete="off">
        {isInitialVersion && initialVersionFormItems}

        {!isInitialVersion && (
          <Form.Item
            name="parentVersionId"
            label={t.templateDetail.parentVersion}
            rules={[{ required: true }]}
          >
            <Select disabled>
              {versions.map((v) => (
                <Select.Option key={v.id} value={v.id}>
                  {v.version} {v.isBranch ? "(Branch)" : ""}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {!isInitialVersion && (
          <Form.Item
            name="versionType"
            label={t.templateDetail.versionType}
            rules={[{ required: true }]}
          >
            <Select>
              {isParentTerminal && (
                <>
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
                </>
              )}
              <Select.Option value="Branch">
                {t.templateDetail.types.Branch}
              </Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item label={t.templateDetail.versionNumber} required>
          {selectedType === "Branch" && !isInitialVersion ? (
            <Space.Compact style={{ width: "100%" }}>
              <Input
                style={{ width: "60%", color: "#666", cursor: "not-allowed" }}
                value={`${baseVersionPrefix}-`}
                disabled
              />
              <Form.Item
                name="branchSuffix" // Use a temporary field for validation
                noStyle
                rules={[
                  {
                    required: true,
                    message: t.templateDetail.inputBranchName,
                  },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: t.templateDetail.branchNamePattern,
                  },
                ]}
                initialValue="branch"
              >
                <Input
                  style={{ width: "40%" }}
                  placeholder={t.templateDetail.branchNamePlaceholder}
                  value={branchSuffix}
                  onChange={(e) => setBranchSuffix(e.target.value)}
                />
              </Form.Item>
            </Space.Compact>
          ) : (
            <Form.Item name="version" noStyle rules={[{ required: true }]}>
              <Input disabled={!isInitialVersion} />
            </Form.Item>
          )}
        </Form.Item>

        {/* Hidden field to store full version string for Branch type submission */}
        {selectedType === "Branch" && (
          <Form.Item name="version" hidden>
            <Input />
          </Form.Item>
        )}

        <Form.Item name="description" label={t.templateDetail.versionDesc}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VersionCreationModal;
