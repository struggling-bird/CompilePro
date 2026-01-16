import React, { useRef, useState, useEffect } from "react";
/**
 * VersionTimeline Component
 *
 * Visualizes a version history graph using G6.
 * Supports branching, merging, and version management actions.
 *
 * Props:
 * @param versions - Array of VersionNode objects representing the version history
 * @param currentVersionId - The ID of the currently selected version
 * @param onChange - Callback when a version node is clicked
 * @param onAddVersion - Callback to trigger adding a new version
 * @param onCreateBranchFrom - Callback to trigger creating a branch from a specific version
 * @param onMerge - Callback to trigger merging a version
 * @param onDelete - Callback to delete a version
 * @param onStatusChange - Callback to change version status (e.g. deprecate)
 */
import { VersionNode } from "../types";
import Toolbar from "./Toolbar";
import ContextMenu from "./ContextMenu";
import DisableModal from "./DisableModal";
import { useVersionGraph } from "./useVersionGraph";

interface VersionTimelineProps {
  versions: VersionNode[];
  currentVersionId: string;
  onChange: (versionId: string) => void;
  onAddVersion: () => void;
  onCreateBranchFrom: (versionId: string) => void;
  onMerge: (sourceId: string) => void;
  onDelete: (versionId: string) => void;
  onStatusChange?: (
    versionId: string,
    status: "Active" | "Deprecated",
    reason?: string
  ) => void;
}

const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  currentVersionId,
  onChange,
  onCreateBranchFrom,
  onMerge,
  onDelete,
  onStatusChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string;
  }>({ visible: false, x: 0, y: 0, nodeId: "" });

  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [targetNodeId, setTargetNodeId] = useState<string>("");

  const handleContextMenu = (e: { x: number; y: number; nodeId: string }) => {
    setContextMenuState({
      visible: true,
      x: e.x,
      y: e.y,
      nodeId: e.nodeId,
    });
  };

  const handleCanvasClick = () => {
    setContextMenuState((prev) => ({ ...prev, visible: false }));
  };

  const { zoomIn, zoomOut, fitView, actualSize } = useVersionGraph({
    containerRef,
    versions,
    currentVersionId,
    onChange,
    onContextMenu: handleContextMenu,
    onCanvasClick: handleCanvasClick,
  });

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          zoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          zoomOut();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut]);

  const handleMenuAction = (key: string, nodeId: string) => {
    setContextMenuState((prev) => ({ ...prev, visible: false }));

    if (key === "branch") {
      onCreateBranchFrom(nodeId);
    } else if (key === "merge") {
      onMerge(nodeId);
    } else if (key === "delete") {
      onDelete(nodeId);
    } else if (key === "disable") {
      setTargetNodeId(nodeId);
      setDisableModalVisible(true);
    } else if (key === "enable") {
      if (onStatusChange) {
        onStatusChange(nodeId, "Active");
      }
    }
  };

  const handleDisableConfirm = (values: { reason: string }) => {
    if (onStatusChange) {
      onStatusChange(targetNodeId, "Deprecated", values.reason);
    }
    setDisableModalVisible(false);
  };

  return (
    <div style={{ padding: "0 16px", position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "400px",
          background: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #f0f0f0",
          position: "relative",
        }}
      >
        <Toolbar
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitView={fitView}
          onActualSize={actualSize}
        />
      </div>

      <ContextMenu
        visible={contextMenuState.visible}
        x={contextMenuState.x}
        y={contextMenuState.y}
        nodeId={contextMenuState.nodeId}
        versions={versions}
        onAction={handleMenuAction}
        onClose={() =>
          setContextMenuState((prev) => ({ ...prev, visible: false }))
        }
      />

      <DisableModal
        visible={disableModalVisible}
        onCancel={() => setDisableModalVisible(false)}
        onConfirm={handleDisableConfirm}
      />
    </div>
  );
};

export default VersionTimeline;
