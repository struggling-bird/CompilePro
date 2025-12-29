import React, { useState } from "react";
import { Form, Input, Row, Col, Upload, Button, Tooltip } from "antd";
import { DeleteOutlined, PaperClipOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

interface FileReplacePanelProps {
  selectedFile: string;
  isTargetEditEnabled: boolean;
  uploadedTargetFile: File | null;
  targetImagePreviewUrl: string;
  imagePreviewUrl: string;
  onUploadedTargetFileChange: (file: File | null) => void;
  onTargetImagePreviewUrlChange: (url: string) => void;
}

const FileReplacePanel: React.FC<FileReplacePanelProps> = ({
  selectedFile,
  isTargetEditEnabled,
  uploadedTargetFile,
  targetImagePreviewUrl,
  imagePreviewUrl,
  onUploadedTargetFileChange,
  onTargetImagePreviewUrlChange,
}) => {
  const [isTargetPreviewHover, setIsTargetPreviewHover] = useState(false);

  const ext = selectedFile?.split(".").pop()?.toLowerCase();
  const isImageExt = (e?: string) =>
    ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
      (e || "").toLowerCase()
    );

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="name"
            label="配置名称"
            rules={[{ required: true, message: "请输入配置名称" }]}
          >
            <Input placeholder="Config Name" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="fileOriginPath" hidden rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="description" label="配置描述">
            <Input placeholder="Description" />
          </Form.Item>
        </Col>
      </Row>

      {isTargetEditEnabled && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#666" }}>目标文件</div>
          <Dragger
            multiple={false}
            maxCount={1}
            showUploadList={false}
            beforeUpload={(file) => {
              onUploadedTargetFileChange(file as File);
              return false;
            }}
            onChange={({ fileList }) => {
              const last = fileList[fileList.length - 1];
              const f = last?.originFileObj as File | undefined;
              onUploadedTargetFileChange(f ?? null);
            }}
            accept=".png,.jpg,.jpeg,.gif,.webp,.svg"
            style={{ marginTop: 8 }}
          >
            {uploadedTargetFile ? (
              <div
                style={{ position: "relative", width: "100%" }}
                onMouseEnter={() => setIsTargetPreviewHover(true)}
                onMouseLeave={() => setIsTargetPreviewHover(false)}
              >
                {/* 状态栏：默认隐藏，hover显示 */}
                {isTargetPreviewHover && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 32,
                      background: "rgba(0, 0, 0, 0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 12px",
                      zIndex: 10,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      backdropFilter: "blur(4px)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#fff",
                        fontSize: 12,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        maxWidth: "85%",
                      }}
                    >
                      <PaperClipOutlined style={{ marginRight: 6 }} />
                      <span title={uploadedTargetFile.name}>
                        {uploadedTargetFile.name}
                      </span>
                    </div>
                    <Tooltip title="删除文件">
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUploadedTargetFileChange(null);
                          onTargetImagePreviewUrlChange("");
                        }}
                        style={{
                          color: "#fff",
                          padding: 0,
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#ff4d4f")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#fff")
                        }
                      />
                    </Tooltip>
                  </div>
                )}

                {targetImagePreviewUrl ? (
                  <img
                    src={targetImagePreviewUrl}
                    alt={uploadedTargetFile.name}
                    style={{ maxWidth: "100%", maxHeight: 300 }}
                  />
                ) : (
                  <div style={{ color: "#999", padding: 20 }}>
                    {uploadedTargetFile.name}
                  </div>
                )}
              </div>
            ) : (
              <>
                <p className="ant-upload-drag-icon"></p>
                <p className="ant-upload-text">点击或拖拽文件上传</p>
                <p className="ant-upload-hint">支持: PNG, JPG, SVG</p>
              </>
            )}
          </Dragger>
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>文件预览</div>
      <div
        style={{
          marginTop: 8,
          minHeight: 220,
          border: "1px dashed #d9d9d9",
          borderRadius: 4,
          padding: 12,
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selectedFile ? (
          isImageExt(ext) ? (
            imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt={selectedFile}
                style={{ maxWidth: "100%", maxHeight: 360 }}
              />
            ) : (
              <div style={{ color: "#999" }}>图片预览不可用</div>
            )
          ) : (
            <div style={{ color: "#999" }}>仅支持图片类型预览</div>
          )
        ) : (
          <div style={{ color: "#999" }}>请从左侧选择文件</div>
        )}
      </div>
    </div>
  );
};

export default FileReplacePanel;
