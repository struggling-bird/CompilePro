import { useEffect, useRef, useMemo, useState } from "react";
import { Graph } from "@antv/g6";
import { VersionNode } from "../types";
import { calculateLayout } from "./layout";
import { useLanguage } from "../../../contexts/LanguageContext";

interface UseVersionGraphProps {
  containerRef: React.RefObject<HTMLDivElement>;
  versions: VersionNode[];
  currentVersionId: string;
  onChange: (versionId: string) => void;
  onContextMenu: (e: { x: number; y: number; nodeId: string }) => void;
  onCanvasClick: () => void;
}

export const useVersionGraph = ({
  containerRef,
  versions,
  currentVersionId,
  onChange,
  onContextMenu,
  onCanvasClick,
}: UseVersionGraphProps) => {
  const { t } = useLanguage();
  const graphRef = useRef<Graph | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const graphData = useMemo(() => {
    return calculateLayout(versions, currentVersionId);
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
        onContextMenu({
          x: clientX,
          y: clientY,
          nodeId: e.target.id,
        });
      });

      graph.on("canvas:click", () => {
        onCanvasClick();
      });
    } else {
      // Update data
      graphRef.current.setData(graphData);
      graphRef.current.render();
    }
  }, [graphData, onChange, t, onContextMenu, onCanvasClick]);

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

  const zoomIn = () => {
    if (graphRef.current) {
      const zoom = graphRef.current.getZoom();
      graphRef.current.zoomTo(zoom * 1.2);
      setZoomLevel(zoom * 1.2);
    }
  };

  const zoomOut = () => {
    if (graphRef.current) {
      const zoom = graphRef.current.getZoom();
      graphRef.current.zoomTo(zoom * 0.8);
      setZoomLevel(zoom * 0.8);
    }
  };

  const fitView = () => {
    if (graphRef.current) {
      graphRef.current.fitView();
      setZoomLevel(graphRef.current.getZoom());
    }
  };

  const actualSize = () => {
    if (graphRef.current) {
      graphRef.current.zoomTo(1);
      setZoomLevel(1);
    }
  };

  return {
    zoomIn,
    zoomOut,
    fitView,
    actualSize,
    zoomLevel,
  };
};
