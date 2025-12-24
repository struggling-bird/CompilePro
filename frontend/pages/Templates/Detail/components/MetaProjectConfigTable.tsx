import React, { useState } from "react";
import {
  Table,
  Button,
  Switch,
  Input,
  Select,
  Modal,
  Form,
  Space,
  Popconfirm,
  Checkbox,
  Tag,
  Typography,
} from "antd";
import { EditOutlined, DeleteOutlined, DownOutlined } from "@ant-design/icons";
import { TemplateModuleConfig, TemplateGlobalConfig } from "../../../../types";

interface MetaProjectConfigTableProps {
  value?: TemplateModuleConfig[];
  onChange?: (value: TemplateModuleConfig[]) => void;
  globalConfigs?: TemplateGlobalConfig[];
  isBranch?: boolean;
}

const MetaProjectConfigTable: React.FC<MetaProjectConfigTableProps> = ({
  value = [],
  onChange,
  globalConfigs = [],
  isBranch = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TemplateModuleConfig | null>(
    null
  );
  const [form] = Form.useForm();

  // Watch mappingType to conditionally render mappingValue input
  const mappingType = Form.useWatch("mappingType", form);

  const handleEdit = (record: TemplateModuleConfig) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const newValue = value.filter((item) => item.id !== id);
    onChange?.(newValue);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let newValue = [...value];
      if (editingItem) {
        const index = newValue.findIndex((item) => item.id === editingItem.id);
        if (index > -1) {
          newValue[index] = { ...editingItem, ...values };
        }
      }
      onChange?.(newValue);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    const newValue = value.map((item) =>
      item.id === id ? { ...item, isSelected: checked } : item
    );
    onChange?.(newValue);
  };

  const columns = [
    {
      title: "选择",
      key: "isSelected",
      render: (_: any, record: TemplateModuleConfig) => (
        <Checkbox
          checked={record.isSelected}
          onChange={(e) => handleToggleSelect(record.id, e.target.checked)}
        />
      ),
      width: 50,
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "文件位置",
      dataIndex: "fileLocation",
      key: "fileLocation",
      width: 150,
import styles from "../../styles/Detail.module.less";

// ... inside columns ...
      render: (text: string) => (
        <span className={styles.monospace}>{text}</span>
      ),
    },
    {
      title: "默认值",
      key: "defaultValue",
      width: 200,
      render: (_: any, record: TemplateModuleConfig) => {
        if (record.mappingType === "GLOBAL") {
          const globalConfig = globalConfigs.find(
            (c) => c.id === record.mappingValue
          );
          return (
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "2px",
                padding: "0 8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
                height: 32,
                color: "#000000d9",
              }}
            >
              <span>全局配置: {globalConfig?.name || record.mappingValue}</span>
              <DownOutlined style={{ fontSize: 12, color: "#bfbfbf" }} />
            </div>
          );
        }
        return record.mappingValue;
      },
    },
    {
      title: "正则表达式",
      dataIndex: "regex",
      key: "regex",
      width: 120,
      render: (text: string) => (
        <span style={{ fontFamily: "monospace" }}>{text}</span>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "是否隐藏",
      dataIndex: "isHidden",
      key: "isHidden",
      width: 80,
      render: (isHidden: boolean) => (isHidden ? "是" : "否"),
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: any, record: TemplateModuleConfig) => (
        <Space size="middle">
          <Typography.Link onClick={() => handleEdit(record)}>
            编辑
          </Typography.Link>
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDelete(record.id)}
            disabled={isBranch} // Disable delete in branch mode (simple implementation)
          >
            <Typography.Link type="danger" disabled={isBranch}>
              删除
            </Typography.Link>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        dataSource={value}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        bordered
      />

      <Modal
        title="编辑配置项"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="fileLocation" label="文件位置">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="mappingType"
            label="取值方式"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="FIXED">自定义</Select.Option>
              <Select.Option value="GLOBAL">全局配置</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev.mappingType !== current.mappingType
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("mappingType");
              return type === "GLOBAL" ? (
                <Form.Item
                  name="mappingValue"
                  label="选择全局配置"
                  rules={[{ required: true }]}
                >
                  <Select>
                    {globalConfigs.map((gc) => (
                      <Select.Option key={gc.id} value={gc.id}>
                        {gc.name} ({gc.defaultValue})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  name="mappingValue"
                  label="自定义值"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item name="regex" label="正则表达式">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="isHidden" label="是否隐藏" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MetaProjectConfigTable;
