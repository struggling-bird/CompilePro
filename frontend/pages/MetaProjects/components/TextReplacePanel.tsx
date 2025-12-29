import React from "react";
import { Form, Input, InputNumber, Row, Col, Spin } from "antd";
import FilePreview from "@/components/FilePreview";

interface TextReplacePanelProps {
  form: any;
  fileContent: string;
  selectedFile: string;
  loadingContent: boolean;
  matchCount: number;
  matchIndex: number;
  regexPattern: string;
  isTargetEditEnabled: boolean;
  onMatchCountChange: (count: number) => void;
}

const TextReplacePanel: React.FC<TextReplacePanelProps> = ({
  fileContent,
  selectedFile,
  loadingContent,
  matchCount,
  matchIndex,
  regexPattern,
  isTargetEditEnabled,
  onMatchCountChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 8,
      }}
    >
      <div style={{ padding: "8px 16px 0", borderBottom: "1px solid #f0f0f0" }}>
        {/* Hidden but required field for selected file */}
        <Form.Item name="fileOriginPath" rules={[{ required: true }]} hidden>
          <Input />
        </Form.Item>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="配置名称"
              rules={[{ required: true, message: "请输入配置名称" }]}
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="Config Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label="配置描述"
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="Description" />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              name="textOrigin"
              label="正则表达式"
              rules={[{ required: true, message: "请输入正则表达式" }]}
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="/pattern/flags" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="matchIndex"
              label="匹配项索引 (从0开始)"
              initialValue={0}
              style={{ marginBottom: 6 }}
            >
              <InputNumber
                min={0}
                max={matchCount > 0 ? matchCount - 1 : 0}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
        {isTargetEditEnabled && (
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item name="textTarget" label="替换目标值">
                <Input placeholder="Replacement Value" />
              </Form.Item>
            </Col>
          </Row>
        )}
      </div>
      <div
        style={{
          padding: "6px 16px",
          background: "#333",
          color: "#fff",
          borderBottom: "1px solid #444",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <span>预览内容</span>
        {matchCount > 0 && (
          <span style={{ color: "#ffaa00" }}>匹配到 {matchCount} 处</span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          padding: 16,
          overflow: "auto",
          minHeight: 200,
        }}
      >
        <Spin spinning={loadingContent}>
          <FilePreview
            content={fileContent}
            fileName={selectedFile}
            regexPattern={regexPattern}
            matchIndex={matchIndex}
            onMatchCountChange={onMatchCountChange}
          />
        </Spin>
      </div>
    </div>
  );
};

export default TextReplacePanel;
