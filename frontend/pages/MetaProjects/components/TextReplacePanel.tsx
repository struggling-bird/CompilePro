import React from "react";
import { Form, Input, InputNumber, Row, Col, Radio, Select, Spin } from "antd";
import { useLanguage } from "@/contexts/LanguageContext";
import { TemplateGlobalConfig } from "@/types";
import FilePreview from "@/components/FilePreview";

interface TextReplacePanelProps {
  form: any;
  fileContent: string;
  selectedFile: string;
  loadingContent: boolean;
  matchCount: number;
  matchIndex: number;
  groupIndex: number;
  regexPattern: string;
  isTargetEditEnabled: boolean;
  onMatchCountChange: (count: number) => void;
  globalConfigs?: TemplateGlobalConfig[];
}

const TextReplacePanel: React.FC<TextReplacePanelProps> = ({
  form,
  fileContent,
  selectedFile,
  loadingContent,
  matchCount,
  matchIndex,
  groupIndex,
  regexPattern,
  isTargetEditEnabled,
  onMatchCountChange,
  globalConfigs = [],
}) => {
  const { t } = useLanguage();
  const mappingType = Form.useWatch("mappingType", {
    form: form,
    preserve: true,
  });

  const groupCount = React.useMemo(() => {
    if (!regexPattern) return 0;
    try {
      let pattern = regexPattern;
      const match = regexPattern.match(/^\/(.*?)\/([gimsuy]*)$/);
      if (match) {
        pattern = match[1];
      }
      const r = new RegExp(pattern + '|');
      const m = r.exec('');
      return m ? m.length - 1 : 0;
    } catch {
      return 0;
    }
  }, [regexPattern]);

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
              label={t.projectDetail.configName}
              rules={[
                { required: true, message: t.projectDetail.inputConfigName },
              ]}
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="Config Name" disabled={isTargetEditEnabled} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label={t.projectDetail.configDescTitle}
              style={{ marginBottom: 6 }}
            >
              <Input placeholder="Description" disabled={isTargetEditEnabled} />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              name="textOrigin"
              label={t.projectDetail.regexLabel}
              rules={[{ required: true, message: t.projectDetail.inputRegex }]}
              style={{ marginBottom: 6 }}
            >
              <Input
                placeholder="/pattern/flags"
                disabled={isTargetEditEnabled}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="matchIndex"
              label={t.projectDetail.matchIndex}
              initialValue={0}
              style={{ marginBottom: 6 }}
            >
              <InputNumber
                min={0}
                max={matchCount > 0 ? matchCount - 1 : 0}
                style={{ width: "100%" }}
                disabled={isTargetEditEnabled}
              />
            </Form.Item>
          </Col>
          {groupCount > 0 && (
            <Col span={24}>
              <Form.Item
                name="groupIndex"
                label={t.projectDetail.targetGroup}
                initialValue={0}
                style={{ marginBottom: 6 }}
                tooltip={t.projectDetail.targetGroupTooltip}
              >
                <Select disabled={isTargetEditEnabled}>
                  <Select.Option value={0}>{t.projectDetail.group0}</Select.Option>
                  {Array.from({ length: groupCount }).map((_, i) => (
                    <Select.Option key={i + 1} value={i + 1}>
                      {t.projectDetail.groupN.replace("{{n}}", String(i + 1))}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>
        {isTargetEditEnabled && (
          <div
            style={{
              marginTop: 8,
              borderTop: "1px dashed #eee",
              paddingTop: 8,
            }}
          >
            <Form.Item
              name="mappingType"
              label={t.projectDetail.mappingType}
              initialValue="MANUAL"
              style={{ marginBottom: 8 }}
            >
              <Radio.Group>
                <Radio value="MANUAL">{t.templateDetail.manualInput}</Radio>
                <Radio value="GLOBAL">{t.templateDetail.mapToGlobal}</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) =>
                prev.mappingType !== curr.mappingType
              }
            >
              {({ getFieldValue }) => {
                const type = getFieldValue("mappingType");
                return type === "GLOBAL" ? (
                  <Form.Item
                    name="mappingValue"
                    label={t.projectDetail.selectGlobalConfig}
                    rules={[
                      {
                        required: true,
                        message: t.projectDetail.selectGlobalConfigPlaceholder,
                      },
                    ]}
                  >
                    <Select placeholder={t.projectDetail.selectGlobalTextConfig}>
                      {globalConfigs
                        .filter((c) => c.type === "TEXT")
                        .map((c) => (
                          <Select.Option key={c.id} value={c.id}>
                            {c.name} ({c.defaultValue})
                          </Select.Option>
                        ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="textTarget"
                    label={t.projectDetail.targetValue}
                  >
                    <Input placeholder={t.projectDetail.replacementLabel} />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </div>
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
        <span>{t.projectDetail.previewContent}</span>
        {matchCount > 0 && (
          <span style={{ color: "#ffaa00" }}>
            {t.projectDetail.matchCount.replace(
              "{{count}}",
              String(matchCount)
            )}
          </span>
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
            groupIndex={groupIndex}
            onMatchCountChange={onMatchCountChange}
          />
        </Spin>
      </div>
    </div>
  );
};

export default TextReplacePanel;
