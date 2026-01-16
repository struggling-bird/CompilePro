import React from "react";
import { Button, Tooltip } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  CompressOutlined,
  OneToOneOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onActualSize: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onFitView,
  onActualSize,
}) => {
  const { t } = useLanguage();

  return (
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
      <Tooltip title={t.templateDetail.zoomIn} placement="right">
        <Button
          type="text"
          icon={<ZoomInOutlined />}
          onClick={onZoomIn}
          size="small"
        />
      </Tooltip>
      <Tooltip title={t.templateDetail.zoomOut} placement="right">
        <Button
          type="text"
          icon={<ZoomOutOutlined />}
          onClick={onZoomOut}
          size="small"
        />
      </Tooltip>
      <Tooltip title={t.templateDetail.fitView} placement="right">
        <Button
          type="text"
          icon={<CompressOutlined />}
          onClick={onFitView}
          size="small"
        />
      </Tooltip>
      <Tooltip title="Actual Size (100%)" placement="right">
        <Button
          type="text"
          icon={<OneToOneOutlined />}
          onClick={onActualSize}
          size="small"
        />
      </Tooltip>
      <Tooltip title={t.templateDetail.handTool} placement="right">
        <Button
          type="text"
          icon={<DragOutlined />}
          style={{ color: "#1890ff", background: "#e6f7ff" }}
          size="small"
        />
      </Tooltip>
    </div>
  );
};

export default Toolbar;
