import React, { useEffect, useRef, useMemo, useState } from "react";
import { Menu } from "antd";
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
}

const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  currentVersionId,
  onChange,
  onCreateBranchFrom,
  onMerge,
  onDelete,
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

    // Second pass: Create Graph Data
    sortedVersions.forEach((v) => {
      // Node fill: Use assigned branch color.
      // If current selected, we use a thicker stroke or size to indicate, but keep the fill color consistent.
      const branchColor = nodeColorMap.get(v.id) || MAIN_COLOR;
      const isSelected = v.id === currentVersionId;

      const node = {
        id: v.id,
        data: v,
        style: {
          fill: branchColor,
          stroke: "#fff", // Reverted to standard white stroke
          lineWidth: isSelected ? 4 : 2, // Keep size/width diff for selection
          size: isSelected ? 24 : 16,
          cursor: "pointer",
          labelText: v.version,
          labelPlacement: "bottom",
          labelOffset: 4,
          labelFill: "#666",
          labelBackground: true,
          labelBackgroundFill: "rgba(255, 255, 255, 0.75)",
          labelBackgroundRadius: 2,
        },
      };

      nodes.push(node);

      if (v.baseVersion && versionMap.has(v.baseVersion)) {
        // Edge Color:
        // Usually edge takes the color of the *target* node (the child),
        // because the edge represents "transition to this state".
        // If Child is Green (Main), Edge is Green.
        // If Child is Purple (Branch), Edge is Purple.

        // Wait, if Main -> Branch (New Color), edge should be New Color?
        // Yes, the line diverges.
        // If Branch A -> Branch A (Inherit), edge is Branch A color.

        const edgeColor = nodeColorMap.get(v.id) || MAIN_COLOR;

        edges.push({
          source: v.baseVersion,
          target: v.id,
          style: {
            stroke: edgeColor,
            lineWidth: 2,
            endArrow: true,
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
        layout: {
          type: "dagre",
          rankdir: "LR",
          nodesep: 40,
          ranksep: 80,
          controlPoints: true,
          // align: 'UL', // Align to upper-left might help keep the "first" (main) branch straight if it's the first child
          ranker: "tight-tree", // Try 'tight-tree' or 'longest-path'
        },
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

  const handleMenuClick = (key: string) => {
    setContextMenuState((prev) => ({ ...prev, visible: false }));
    if (key === "branch") {
      onCreateBranchFrom(contextMenuState.nodeId);
    } else if (key === "merge") {
      onMerge(contextMenuState.nodeId);
    } else if (key === "delete") {
      onDelete(contextMenuState.nodeId);
    }
  };

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
      key: "delete",
      label: t.templateDetail.delete,
      danger: true,
    },
  ];

  return (
    <div style={{ padding: "0 16px" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "400px",
          background: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #f0f0f0",
        }}
      />
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
    </div>
  );
};

export default VersionTimeline;
