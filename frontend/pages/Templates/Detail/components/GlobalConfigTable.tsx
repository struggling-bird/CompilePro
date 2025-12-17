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
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { TemplateGlobalConfig } from "../../../../types";

interface GlobalConfigTableProps {
  value?: TemplateGlobalConfig[];
  onChange?: (value: TemplateGlobalConfig[]) => void;
}

const GlobalConfigTable: React.FC<GlobalConfigTableProps> = ({
  value = [],
  onChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TemplateGlobalConfig | null>(
    null
  );
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: "TEXT",
      isHidden: false,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (record: TemplateGlobalConfig) => {
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
      } else {
        newValue.push({
          id: Date.now().toString(),
          ...values,
        });
      }
      onChange?.(newValue);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Validate Failed:", error);
    }
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "默认值",
      dataIndex: "defaultValue",
      key: "defaultValue",
      render: (text: string, record: TemplateGlobalConfig) => (
        <Space>
          {record.type === "FILE" && <Tag color="blue">文件</Tag>}
          <span className="text-gray-600">{text}</span>
        </Space>
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
      width: 100,
      render: (isHidden: boolean) => (isHidden ? "是" : "否"),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_: any, record: TemplateGlobalConfig) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white">
      <Table
        dataSource={value}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="middle"
        bordered
      />
      <Button
        type="dashed"
        onClick={handleAdd}
        style={{ marginTop: 8 }}
        icon={<PlusOutlined />}
      >
        添加配置项
      </Button>

      <Modal
        title={editingItem ? "编辑全局配置" : "添加全局配置"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="TEXT">文本</Select.Option>
              <Select.Option value="FILE">文件</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="defaultValue"
            label="默认值"
            rules={[{ required: true, message: "请输入默认值" }]}
          >
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

export default GlobalConfigTable;
