import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Upload,
  Button,
  Tooltip,
  Radio,
  Select,
  Card,
} from "antd";
import { DeleteOutlined, PaperClipOutlined } from "@ant-design/icons";
import { TemplateGlobalConfig } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const { Dragger } = Upload;

interface FileReplacePanelProps {
  selectedFile: string;
  isTargetEditEnabled: boolean;
  uploadedTargetFile: File | null;
  targetImagePreviewUrl: string;
  imagePreviewUrl: string;
  onUploadedTargetFileChange: (file: File | null) => void;
  onTargetImagePreviewUrlChange: (url: string) => void;
  globalConfigs?: TemplateGlobalConfig[];
}

const FileReplacePanel: React.FC<FileReplacePanelProps> = ({
  selectedFile,
  isTargetEditEnabled,
  uploadedTargetFile,
  targetImagePreviewUrl,
  imagePreviewUrl,
  onUploadedTargetFileChange,
  onTargetImagePreviewUrlChange,
  globalConfigs = [],
}) => {
  const [isTargetPreviewHover, setIsTargetPreviewHover] = useState(false);
  const { t } = useLanguage();
  const [originSize, setOriginSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [targetSize, setTargetSize] = useState<{ w: number; h: number } | null>(
    null
  );

  const ext = selectedFile?.split(".").pop()?.toLowerCase();
  const isImageExt = (e?: string) =>
    ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
      (e || "").toLowerCase()
    );

  useEffect(() => {
    if (imagePreviewUrl) {
      const img = new Image();
      img.onload = () =>
        setOriginSize({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => setOriginSize(null);
      img.src = imagePreviewUrl;
    } else {
      setOriginSize(null);
    }
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (targetImagePreviewUrl) {
      const img = new Image();
      img.onload = () =>
        setTargetSize({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => setTargetSize(null);
      img.src = targetImagePreviewUrl;
    } else {
      setTargetSize(null);
    }
  }, [targetImagePreviewUrl]);

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="name"
            label="配置名称"
            rules={[{ required: true, message: "请输入配置名称" }]}
          >
            <Input placeholder="Config Name" disabled={isTargetEditEnabled} />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="fileOriginPath" hidden rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="description" label="配置描述">
            <Input placeholder="Description" disabled={isTargetEditEnabled} />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ marginTop: 8 }}>
        <div
          style={{
            padding: "6px 12px",
            background: "#f7f7f7",
            border: "1px solid #f0f0f0",
            borderBottom: 0,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            fontSize: 12,
            color: "#555",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{t.projectDetail?.currentAsset || "当前资源预览"}</span>
          {originSize && (
            <span style={{ color: "#888" }}>
              {originSize.w} × {originSize.h}
            </span>
          )}
        </div>
        <Card
          bodyStyle={{ padding: 12 }}
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="origin-preview"
              style={{
                width: "100%",
                maxHeight: 240,
                objectFit: "contain",
                borderRadius: 4,
              }}
            />
          ) : (
            <div style={{ padding: 12, textAlign: "center", color: "#888" }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                {selectedFile || "请选择文件"}
              </div>
              <div style={{ fontSize: 12 }}>
                {isImageExt(ext)
                  ? t.settings?.previewNotAvailable || "预览不可用"
                  : t.settings?.previewNotAvailable || "预览不可用"}
              </div>
            </div>
          )}
        </Card>
      </div>

      {isTargetEditEnabled && (
        <div
          style={{ marginTop: 8, borderTop: "1px dashed #eee", paddingTop: 8 }}
        >
          <Form.Item
            name="mappingType"
            label="映射类型"
            initialValue="MANUAL"
            style={{ marginBottom: 8 }}
          >
            <Radio.Group>
              <Radio value="MANUAL">手动上传</Radio>
              <Radio value="GLOBAL">全局配置</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.mappingType !== curr.mappingType}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("mappingType");
              return type === "GLOBAL" ? (
                <Form.Item
                  name="mappingValue"
                  label="选择全局配置"
                  rules={[{ required: true, message: "请选择全局配置" }]}
                >
                  <Select placeholder="选择一个全局文件配置">
                    {globalConfigs
                      .filter((c) => c.type === "FILE")
                      .map((c) => (
                        <Select.Option key={c.id} value={c.id}>
                          {c.name}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              ) : (
                <>
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
                            <span
                              style={{
                                color: "#fff",
                                fontSize: 12,
                                maxWidth: "70%",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {uploadedTargetFile.name}
                            </span>
                            {targetSize && (
                              <span style={{ color: "#ddd", fontSize: 12 }}>
                                {targetSize.w} × {targetSize.h}
                              </span>
                            )}
                            <Button
                              type="text"
                              size="small"
                              icon={
                                <DeleteOutlined style={{ color: "#ff4d4f" }} />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                onUploadedTargetFileChange(null);
                                onTargetImagePreviewUrlChange("");
                                setTargetSize(null);
                              }}
                            />
                          </div>
                        )}

                        {targetImagePreviewUrl ? (
                          <img
                            src={targetImagePreviewUrl}
                            alt="preview"
                            style={{
                              width: "100%",
                              maxHeight: 200,
                              objectFit: "contain",
                              borderRadius: 8,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: 16,
                              textAlign: "center",
                              background: "#f0f2f5",
                              borderRadius: 8,
                            }}
                          >
                            <PaperClipOutlined
                              style={{ fontSize: 24, color: "#999" }}
                            />
                            <div style={{ marginTop: 8, color: "#666" }}>
                              {uploadedTargetFile.name}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: 16 }}>
                        <p className="ant-upload-drag-icon">
                          <PaperClipOutlined />
                        </p>
                        <p className="ant-upload-text">
                          Click or drag file to upload replacement
                        </p>
                      </div>
                    )}
                  </Dragger>
                </>
              );
            }}
          </Form.Item>
        </div>
      )}
    </div>
  );
};

export default FileReplacePanel;
