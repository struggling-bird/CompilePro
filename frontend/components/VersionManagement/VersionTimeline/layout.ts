import dayjs from "dayjs";
import { VersionNode } from "../types";

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

interface GraphData {
  nodes: any[];
  edges: any[];
}

export const calculateLayout = (
  versions: VersionNode[],
  currentVersionId: string
): GraphData => {
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

  // Determine "Main Successor" for each node to decide inheritance
  const mainSuccessorMap = new Map<string, string>();
  versionMap.forEach((v) => {
    const childrenIds = childrenMap.get(v.id) || [];
    if (childrenIds.length > 0) {
      const nonBranchChild = childrenIds.find((childId) => {
        const child = versionMap.get(childId);
        return child?.versionType !== "Branch";
      });

      if (nonBranchChild) {
        mainSuccessorMap.set(v.id, nonBranchChild);
      }
    }
  });

  const nodeColorMap = new Map<string, string>();
  let paletteIndex = 0;

  const getNextColor = () => {
    const color = PALETTE[paletteIndex % PALETTE.length];
    paletteIndex++;
    return color;
  };

  // First pass: Assign colors
  const assignColors = (nodeId: string, parentColor: string | null) => {
    const node = versionMap.get(nodeId);
    if (!node) return;

    let myColor = parentColor;

    if (!parentColor) {
      // Root or New Branch start
      myColor = !node.isBranch ? MAIN_COLOR : getNextColor();
    }

    nodeColorMap.set(nodeId, myColor!);

    // Propagate to children
    const children = childrenMap.get(nodeId) || [];
    const successorId = mainSuccessorMap.get(nodeId);

    children.forEach((childId) => {
      if (childId === successorId) {
        // Inherit color
        assignColors(childId, myColor);
      } else {
        // New Branch -> New Color
        assignColors(childId, null);
      }
    });
  };

  roots.forEach((rootId) => assignColors(rootId, null));

  // --- Manual Layout Algorithm ---
  const nodeLaneMap = new Map<string, number>();
  let maxLaneIndex = 0;

  // Helper: Get next available lane
  const getNextLane = () => {
    maxLaneIndex++;
    return maxLaneIndex;
  };

  // DFS to assign Lanes
  const assignLanes = (nodeId: string, currentLane: number) => {
    nodeLaneMap.set(nodeId, currentLane);

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return;

    const successorId = mainSuccessorMap.get(nodeId);

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
    const root = versionMap.get(rootId);
    const lane = !root?.isBranch ? 0 : getNextLane();
    assignLanes(rootId, lane);
  });

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

  // Second pass: Create Graph Data
  sortedVersions.forEach((v) => {
    let branchColor = nodeColorMap.get(v.id) || MAIN_COLOR;
    const isSelected = v.id === currentVersionId;

    const isDeprecated = v.status === "Deprecated";

    if (isDeprecated) {
      branchColor = "#999999";
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
        labelTextDecoration: isDeprecated ? "line-through" : undefined,
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
          arrow: true,
          endArrowSize: 4,
          type: "cubic-horizontal",
        },
      });
    }
  });

  return { nodes, edges };
};
