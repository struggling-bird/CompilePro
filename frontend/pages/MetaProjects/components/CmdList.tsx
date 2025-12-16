import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Input,
  List,
  Typography,
  Space,
  Popconfirm,
  theme,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  MenuOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface CmdListProps {
  commands: string[];
  onUpdate: (newCommands: string[]) => void;
  loading?: boolean;
}

interface SortableItemProps {
  id: string;
  cmd: string;
  onDelete: () => void;
  onEdit: (newCmd: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  cmd,
  onDelete,
  onEdit,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [editing, setEditing] = useState(false);
  const [tempCmd, setTempCmd] = useState(cmd);
  const { token } = theme.useToken();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 8,
    padding: "8px 12px",
    backgroundColor: isDragging ? token.colorFillSecondary : token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: isDragging ? 999 : "auto",
    position: "relative" as const,
  };

  const handleSave = () => {
    if (tempCmd.trim()) {
      onEdit(tempCmd.trim());
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setTempCmd(cmd);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ ...style, cursor: "default" }}>
        <Input
          value={tempCmd}
          onChange={(e) => setTempCmd(e.target.value)}
          onPressEnter={handleSave}
          style={{ marginRight: 8 }}
          autoFocus
        />
        <Space>
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleSave}
            style={{ color: token.colorSuccess }}
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCancel}
          />
        </Space>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        <MenuOutlined
          {...attributes}
          {...listeners}
          style={{
            cursor: "grab",
            marginRight: 12,
            color: token.colorTextSecondary,
          }}
        />
        <Text
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => setEditing(true)}
        >
          {cmd}
        </Text>
      </div>
      <Space>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => setEditing(true)}
        />
        <Popconfirm
          title="确定删除此命令吗？"
          onConfirm={onDelete}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    </div>
  );
};

const CmdList: React.FC<CmdListProps> = ({ commands, onUpdate, loading }) => {
  const [adding, setAdding] = useState(false);
  const [newCmd, setNewCmd] = useState("");
  
  // We need stable IDs for dnd-kit. Since commands are strings and can be duplicates,
  // we map them to objects with unique IDs.
  // However, simple approach: use index as ID if we don't reorder duplicates often?
  // Better: map to { id: string, cmd: string } state locally.
  const [items, setItems] = useState<{ id: string; cmd: string }[]>([]);

  React.useEffect(() => {
    setItems(commands.map((c, i) => ({ id: `${i}-${c}-${Math.random()}`, cmd: c })));
  }, [commands]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      onUpdate(newItems.map((i) => i.cmd));
    }
  };

  const handleAdd = () => {
    if (newCmd.trim()) {
      const updated = [...commands, newCmd.trim()];
      onUpdate(updated);
      setNewCmd("");
      setAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    const newItems = items.filter((i) => i.id !== id);
    onUpdate(newItems.map((i) => i.cmd));
  };

  const handleEdit = (id: string, newVal: string) => {
    const newItems = items.map((i) => (i.id === id ? { ...i, cmd: newVal } : i));
    onUpdate(newItems.map((i) => i.cmd));
  };

  return (
    <div style={{ width: "100%" }}>
      {adding && (
        <div style={{ marginBottom: 12, display: "flex" }}>
          <Input
            value={newCmd}
            onChange={(e) => setNewCmd(e.target.value)}
            onPressEnter={handleAdd}
            placeholder="请输入命令，回车确认"
            autoFocus
            style={{ marginRight: 8 }}
          />
          <Button onClick={() => setAdding(false)}>取消</Button>
        </div>
      )}
      
      {!adding && (
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => setAdding(true)}
          style={{ marginBottom: 12 }}
          loading={loading}
        >
          新建命令
        </Button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              cmd={item.cmd}
              onDelete={() => handleDelete(item.id)}
              onEdit={(val) => handleEdit(item.id, val)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default CmdList;
