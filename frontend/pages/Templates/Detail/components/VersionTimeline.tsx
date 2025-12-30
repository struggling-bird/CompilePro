import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  Menu,
  Modal,
  Input,
  Form,
  message,
  Tooltip,
  Button,
  Space,
} from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  CompressOutlined,
  OneToOneOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { Graph } from "@antv/g6";
import { TemplateVersion } from "../../../../types";
import { useLanguage } from "../../../../contexts/LanguageContext";
import dayjs from "dayjs";

interface VersionTimelineProps {
  versions: TemplateVersion[];
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
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    nodeId: string;
  }>({ visible: false, x: 0, y: 0, nodeId: "" });

  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [disableForm] = Form.useForm();
  const [targetNodeId, setTargetNodeId] = useState<string>("");

  // Toolbar State
  const [zoomLevel, setZoomLevel] = useState(1);

  const graphData = useMemo(() => {
    // Sort versions by date to ensure deterministic layout order for siblings
    const sortedVersions = [...versions].sort((a, b) => {
      const dateA = a.date === "Today" ? dayjs() : dayjs(a.date);
      const dateB = b.date === "Today" ? dayjs() : dayjs(b.date);
      return dateA.isBefore(dateB) ? -1 : 1;
    });

    const nodes: any[] = [];
    const edges: any[] = [];

    // Create a map for quick lookup
    const versionMap = new Map(versions.map((v) => [v.id, v]));

    // --- Dynamic Color Assignment Logic ---
    const MAIN_COLOR = "#1890ff"; // Blue for Main Line
    // Palette for branches (excluding Blue #1890ff)
    const PALETTE = [
      "#722ed1", // Purple
      "#faad14", // Yellow/Orange
      "#eb2f96", // Magenta
      "#13c2c2", // Cyan
      "#f5222d", // Red
      "#fa8c16", // Orange
      "#a0d911", // Lime
    ];

    const nodeColorMap = new Map<string, string>();
    const parentContinuedMap = new Map<string, boolean>();
    let paletteIndex = 0;

    const getNextColor = () => {
      const color = PALETTE[paletteIndex % PALETTE.length];
      paletteIndex++;
      return color;
    };

    // First pass: Assign colors
    sortedVersions.forEach((v) => {
      if (!v.isBranch) {
        nodeColorMap.set(v.id, MAIN_COLOR);
      } else {
        // It is a branch node
        const parentId = v.baseVersion;
        if (!parentId || !versionMap.has(parentId)) {
          // Orphan branch? New color
          nodeColorMap.set(v.id, getNextColor());
        } else {
          const parent = versionMap.get(parentId);
          const parentColor = nodeColorMap.get(parentId) || MAIN_COLOR;

          if (!parent.isBranch) {
            // Parent is Main, so this starts a new branch
            nodeColorMap.set(v.id, getNextColor());
          } else {
            // Parent is Branch
            // Check if this child continues the parent's branch
            // Heuristic: First child that hasn't been claimed continues the color
            // UNLESS names are very different? (Simpler: just use first child for now)

            if (!parentContinuedMap.get(parentId)) {
              // Inherit color
              nodeColorMap.set(v.id, parentColor);
              parentContinuedMap.set(parentId, true);
            } else {
              // Parent already continued by another sibling -> Divergence -> New Color
              nodeColorMap.set(v.id, getNextColor());
            }
          }
        }
      }
    });

    // --- Manual Layout Algorithm ---
    // 1. Determine Lanes (Y-axis)
    // Lane 0 is reserved for Main Branch (!isBranch)
    // Other lanes are dynamically assigned.

    const nodeLaneMap = new Map<string, number>();
    let maxLaneIndex = 0;

    // Helper: Get next available lane
    const getNextLane = () => {
      maxLaneIndex++;
      return maxLaneIndex;
    };

    // Build Adjacency List (Parent -> Children)
    const childrenMap = new Map<string, string[]>();
    // Also track roots
    const roots: string[] = [];

    sortedVersions.forEach((v) => {
      if (!v.baseVersion || !versionMap.has(v.baseVersion)) {
        roots.push(v.id);
      } else {
        const parentId = v.baseVersion;
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, []);
        }
        childrenMap.get(parentId)?.push(v.id);
      }
    });

    // DFS to assign Lanes
    const assignLanes = (nodeId: string, currentLane: number) => {
      nodeLaneMap.set(nodeId, currentLane);

      const children = childrenMap.get(nodeId) || [];
      if (children.length === 0) return;

      // Determine which child continues the current lane
      // Heuristic:
      // 1. If current is Main (Lane 0), look for a Main child.
      // 2. If current is Branch, look for a child that is NOT a new branch (continuing).
      //    (Or if multiple branches, maybe pick the one with same name prefix? For now: first child that is !isBranch or matches logic)

      let successorId: string | null = null;
      const node = versionMap.get(nodeId);

      if (currentLane === 0) {
        // Main Branch: Prefer child that is NOT a branch
        const mainChild = children.find(
          (childId) => !versionMap.get(childId)?.isBranch
        );
        if (mainChild) {
          successorId = mainChild;
        } else if (children.length > 0) {
          // If Main only has branch children, none inherit Lane 0 (Main stops? Rare)
          // Or maybe the "main" flow continues into a branch?
          // User req: "Main branch as baseline". So if no !isBranch child, Main stops here.
        }
      } else {
        // Branch Lane: Prefer child that continues this branch
        // Simple: The first child that is also a branch (or whatever logic defines "continuation")
        // If we have parentContinuedMap logic from color, we can reuse it?
        // Let's use a simple heuristic: First child gets the lane, others get new lanes.
        // BUT: if child is explicitly a "New Branch" (how do we know? isBranch is true for all branch nodes)
        // Assumption: If child.isBranch is true, it *is* on a branch.
        // If parent and child are both isBranch, they are on the same branch unless divergence.
        // Let's just pick the first child as successor.
        if (children.length > 0) {
          successorId = children[0];
        }
      }

      // Process Successor
      if (successorId) {
        assignLanes(successorId, currentLane);
      }

      // Process Other Children (New Lanes)
      children.forEach((childId) => {
        if (childId !== successorId) {
          assignLanes(childId, getNextLane());
        }
      });
    };

    // Start DFS from roots
    roots.forEach((rootId) => {
      // If root is main, start at 0. Else new lane?
      // Usually root is main.
      const root = versionMap.get(rootId);
      const lane = !root?.isBranch ? 0 : getNextLane();
      assignLanes(rootId, lane);
    });

    // 2. Determine Depth (X-axis) - Topological Sort / Layering
    // Simple Depth: Parent Depth + 1
    // However, to ensure strict alignment, we might want to handle merges or just use simple tree depth.
    // Given the requirement "branches connect vertically... and extend horizontally",
    // simple depth is usually sufficient unless we want to compress empty space.
    // Let's use simple depth first.

    const nodeDepthMap = new Map<string, number>();

    const assignDepth = (nodeId: string, depth: number) => {
      nodeDepthMap.set(nodeId, depth);
      const children = childrenMap.get(nodeId) || [];
      children.forEach((childId) => assignDepth(childId, depth + 1));
    };

    roots.forEach((rootId) => assignDepth(rootId, 0));

    // 3. Generate Coordinates
    const X_SPACING = 150;
    const Y_SPACING = 80; // Vertical distance between lanes
    const MAIN_Y = 200; // Offset to center vertically in canvas (or just 0 if we use autoFit center)
    // Actually G6 canvas origin is top-left. Let's use positive Y.

    // Second pass: Create Graph Data
    sortedVersions.forEach((v) => {
      // Node fill: Use assigned branch color.
      // If current selected, we use a thicker stroke or size to indicate, but keep the fill color consistent.
      let branchColor = nodeColorMap.get(v.id) || MAIN_COLOR;
      const isSelected = v.id === currentVersionId;

      const isDeprecated = v.status === "Deprecated";
      let labelDecoration = undefined;

      if (isDeprecated) {
        branchColor = "#999999";
        // G6 might not support textDecoration directly in all versions, but we'll try standard attr
        // If not, we might need a custom shape or just rely on color.
        // However, we can try using the 'fontStyle' or specific G6 properties.
        // For G6 v5, style properties are quite flexible.
      }

      const lane = nodeLaneMap.get(v.id) || 0;
      const depth = nodeDepthMap.get(v.id) || 0;

      // Calculate Grid Coordinates
      const x = depth * X_SPACING + 50; // Add padding
      const y = lane * Y_SPACING + 50; // Add padding. Lane 0 is top (or baseline).

      const node = {
        id: v.id,
        data: v,
        style: {
          x, // Explicit X
          y, // Explicit Y
          fill: branchColor,
          stroke: "#fff", // Reverted to standard white stroke
          lineWidth: isSelected ? 4 : 2, // Keep size/width diff for selection
          size: isSelected ? 24 : 16,
          cursor: "pointer",
          labelText: v.version,
          labelPlacement: "bottom",
          labelOffset: 4,
          labelFill: isDeprecated ? "#999999" : "#666",
          labelBackground: true,
          labelBackgroundFill: "rgba(255, 255, 255, 0.75)",
          labelBackgroundRadius: 2,
          // Try standard CSS property for text decoration if supported by renderer (Canvas/SVG)
          labelTextDecoration: isDeprecated ? "line-through" : undefined,
          // Note: G6 v5 might use different prop for text decoration, e.g. "textDecoration" inside label style object if nested
          // But here style is flat for the node key shape usually, label is separate.
          // Let's try to pass it. If it doesn't work, we rely on color #999999.
        },
      };

      nodes.push(node);

      if (v.baseVersion && versionMap.has(v.baseVersion)) {
        // Edge Color:
        const edgeColor = nodeColorMap.get(v.id) || MAIN_COLOR;

        edges.push({
          source: v.baseVersion,
          target: v.id,
          style: {
            stroke: isDeprecated ? "#999999" : edgeColor,
            lineWidth: 2,
            endArrow: true,
            arrow: true, // Ensure arrow is drawn
            endArrowSize: 4, // Reduce size (default is often around 6-8?)
            type: "cubic-horizontal",
          },
        });
      }
    });

    return { nodes, edges };
  }, [versions, currentVersionId]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!graphRef.current) {
      const graph = new Graph({
        container: containerRef.current,
        width: containerRef.current.offsetWidth,
        height: 400,
        autoFit: "center",
        zoom: 1,
        // Removed 'layout' config to use manual x/y coordinates
        data: graphData,
        node: {
          type: "circle",
          style: {
            // Common styles
          },
          state: {
            active: {
              fill: "#1890ff",
              stroke: "#096dd9",
              lineWidth: 4,
            },
            selected: {
              fill: "#1890ff",
              stroke: "#096dd9",
              lineWidth: 4,
            },
          },
        },
        edge: {
          type: "cubic-horizontal",
          style: {
            // stroke: "#faad14", // Removed global yellow override
            lineWidth: 2,
          },
        },
        behaviors: ["drag-canvas", "zoom-canvas", "drag-element"],
        plugins: [
          {
            type: "tooltip",
            key: "tooltip",
            trigger: "pointerenter",
            getContent: (e: any, items: any[]) => {
              // items[0] is the node data
              const d = items[0]?.data;
              if (!d) return "";
              return `
                      <div style="padding: 8px;">
                        <div style="margin-bottom: 4px;"><strong>${
                          d.version
                        }</strong></div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                          ${d.description || t.templateDetail.noData}
                        </div>
                        <div style="font-size: 12px; color: #999;">
                          <div>${t.templateDetail.versionType}: ${
                d.isBranch ? t.templateDetail.types.Branch : "Tag"
              }</div>
                          <div>Creator: ${d.creator || "System"}</div>
                          <div>Date: ${d.date}</div>
                        </div>
                      </div>
                    `;
            },
          },
        ],
      });

      graph.render();
      graphRef.current = graph;

      // Events
      graph.on("node:click", (e: any) => {
        const nodeId = e.target.id;
        onChange(nodeId);
      });

      graph.on("node:contextmenu", (e: any) => {
        e.preventDefault(); // Prevent native browser menu
        const { clientX, clientY } = e.nativeEvent;
        setContextMenuState({
          visible: true,
          x: clientX,
          y: clientY,
          nodeId: e.target.id,
        });
      });

      graph.on("canvas:click", () => {
        setContextMenuState((prev) => ({ ...prev, visible: false }));
      });
    } else {
      // Update data
      graphRef.current.setData(graphData);
      graphRef.current.render();
    }
  }, [graphData, onChange, t]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current && containerRef.current) {
        graphRef.current.resize(containerRef.current.offsetWidth, 400);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toolbar Handlers
  const handleZoomIn = () => {
    if (graphRef.current) {
      const zoom = graphRef.current.getZoom();
      graphRef.current.zoomTo(zoom * 1.2);
      setZoomLevel(zoom * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const zoom = graphRef.current.getZoom();
      graphRef.current.zoomTo(zoom * 0.8);
      setZoomLevel(zoom * 0.8);
    }
  };

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.fitView();
      setZoomLevel(graphRef.current.getZoom());
    }
  };

  const handleActualSize = () => {
    if (graphRef.current) {
      graphRef.current.zoomTo(1);
      setZoomLevel(1);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-") {
          e.preventDefault();
          handleZoomOut();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMenuClick = (key: string) => {
    setContextMenuState((prev) => ({ ...prev, visible: false }));
    const nodeId = contextMenuState.nodeId;

    if (key === "branch") {
      onCreateBranchFrom(nodeId);
    } else if (key === "merge") {
      onMerge(nodeId);
    } else if (key === "delete") {
      onDelete(nodeId);
    } else if (key === "disable") {
      setTargetNodeId(nodeId);
      setDisableModalVisible(true);
      disableForm.resetFields();
    } else if (key === "enable") {
      if (onStatusChange) {
        onStatusChange(nodeId, "Active");
      }
    }
  };

  const handleDisableConfirm = async () => {
    try {
      const values = await disableForm.validateFields();
      if (onStatusChange) {
        onStatusChange(targetNodeId, "Deprecated", values.reason);
      }
      setDisableModalVisible(false);
    } catch (e) {
      // Validation failed
    }
  };

  const selectedNode = versions.find((v) => v.id === contextMenuState.nodeId);
  const isDeprecated = selectedNode?.status === "Deprecated";

  const contextMenuItems = [
    {
      key: "branch",
      label: t.templateDetail.newVersion,
    },
    {
      key: "merge",
      label: "Merge to Parent", // TODO: i18n
      disabled: !versions.find((v) => v.id === contextMenuState.nodeId)
        ?.isBranch,
    },
    {
      key: isDeprecated ? "enable" : "disable",
      label: isDeprecated ? "Enable Version" : "Disable Version", // TODO: i18n
    },
    {
      key: "delete",
      label: t.templateDetail.delete,
      danger: true,
    },
  ];

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
          // overflow: "hidden" // Removed to allow Tooltip to overflow
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 100,
            background: "#fff",
            padding: "4px",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <Tooltip title="Zoom In (Ctrl + +)" placement="right">
            <Button
              type="text"
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Zoom Out (Ctrl + -)" placement="right">
            <Button
              type="text"
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Fit View" placement="right">
            <Button
              type="text"
              icon={<CompressOutlined />}
              onClick={handleFitView}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Actual Size (100%)" placement="right">
            <Button
              type="text"
              icon={<OneToOneOutlined />}
              onClick={handleActualSize}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Hand Tool (Drag Canvas)" placement="right">
            <Button
              type="text"
              icon={<DragOutlined />}
              style={{ color: "#1890ff", background: "#e6f7ff" }} // Always active style since drag is default
              size="small"
            />
          </Tooltip>
        </div>
      </div>
      {contextMenuState.visible && (
        <div
          style={{
            position: "fixed",
            left: contextMenuState.x,
            top: contextMenuState.y,
            zIndex: 1000,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: "4px",
            padding: "4px 0",
          }}
        >
          <Menu
            items={contextMenuItems}
            onClick={({ key }) => handleMenuClick(key)}
            style={{ border: "none" }}
          />
        </div>
      )}

      <Modal
        title="Disable Version"
        open={disableModalVisible}
        onOk={handleDisableConfirm}
        onCancel={() => setDisableModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <Form form={disableForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason"
            rules={[
              { required: true, message: "Please input reason" },
              { min: 10, message: "Reason must be at least 10 characters" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Please explain why this version is being disabled..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VersionTimeline;
