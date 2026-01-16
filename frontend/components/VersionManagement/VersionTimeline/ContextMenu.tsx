import React, { useMemo } from "react";
import { Menu, Tooltip } from "antd";
import { useLanguage } from "../../../contexts/LanguageContext";
import { VersionNode } from "../types";

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  nodeId: string;
  versions: VersionNode[];
  onAction: (key: string, nodeId: string) => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  nodeId,
  versions,
  onAction,
}) => {
  const { t } = useLanguage();

  const selectedNode = versions.find((v) => v.id === nodeId);
  const isDeprecated = selectedNode?.status === "Deprecated";

  // Check if selected node has children (is not a leaf node)
  const hasChildren = useMemo(() => {
    if (!nodeId) return false;
    return versions.some((v) => v.baseVersion === nodeId);
  }, [nodeId, versions]);

  const items = [
    {
      key: "branch",
      label: t.templateDetail.newVersion,
    },
    {
      key: "merge",
      label: t.templateDetail.mergeToParent,
      disabled: !selectedNode?.isBranch,
    },
    {
      key: isDeprecated ? "enable" : "disable",
      label: isDeprecated
        ? t.templateDetail.enableVersion
        : t.templateDetail.disableVersion,
    },
    {
      key: "delete",
      label: (
        <Tooltip
          title={
            hasChildren ? t.templateDetail.deleteVersionDependencyWarning : ""
          }
          placement="right"
        >
          <span>{t.templateDetail.delete}</span>
        </Tooltip>
      ),
      danger: true,
      disabled: hasChildren, // Only allow deleting leaf nodes
    },
  ];

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 1000,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: "4px",
        padding: "4px 0",
      }}
    >
      <Menu
        items={items}
        onClick={({ key }) => onAction(key, nodeId)}
        style={{ border: "none" }}
      />
    </div>
  );
};

export default ContextMenu;
