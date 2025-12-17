import React from "react";
import { Button, Popconfirm, Space, Tag, Dropdown, MenuProps, Tooltip } from "antd";
import {
  PlusOutlined,
  MoreOutlined,
  DeleteOutlined,
  StopOutlined,
  BranchesOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { TemplateVersion } from "../../../../types";
import dayjs from "dayjs";

interface VersionTimelineProps {
  versions: TemplateVersion[];
  currentVersionId: string;
  onChange: (versionId: string) => void;
  onAddVersion: () => void;
  onDeleteVersion: (versionId: string) => void;
  onDeprecateVersion: (versionId: string) => void;
  onBranchVersion: (versionId: string) => void;
}

const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  currentVersionId,
  onChange,
  onAddVersion,
  onDeleteVersion,
  onDeprecateVersion,
  onBranchVersion,
}) => {
  const getMenuItems = (version: TemplateVersion): MenuProps["items"] => [
    {
      key: "branch",
      label: "增加分支版本",
      icon: <BranchesOutlined />,
      onClick: () => onBranchVersion(version.id),
    },
    {
      key: "deprecate",
      label: "废弃",
      icon: <StopOutlined />,
      danger: true,
      disabled: version.status === "Deprecated",
      onClick: () => onDeprecateVersion(version.id),
    },
    {
      key: "delete",
      label: "删除",
      icon: <DeleteOutlined />,
      danger: true,
      // disabled: dayjs().diff(dayjs(version.date), "hour") > 12, // Example rule: 12h limit
      onClick: () => onDeleteVersion(version.id),
    },
  ];

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="flex items-center space-x-0 min-w-max px-8 relative">
        {/* Horizontal Line Background */}
        <div className="absolute left-8 right-20 top-[19px] h-0.5 bg-gray-300 z-0" />

        {versions.map((version, index) => {
          const isSelected = version.id === currentVersionId;
          const isLast = index === versions.length - 1;

          return (
            <div key={version.id} className="relative flex flex-col items-center z-10" style={{ width: 140 }}>
              {/* Version Node */}
              <div
                className={`
                  relative w-4 h-4 rounded-full cursor-pointer transition-all duration-300
                  ${
                    isSelected
                      ? "bg-blue-500 border-4 border-blue-200 scale-125 shadow-md"
                      : "bg-white border-2 border-gray-400 hover:border-blue-400"
                  }
                `}
                onClick={() => onChange(version.id)}
              />

              {/* Version Info */}
              <div className="absolute top-6 flex flex-col items-center w-32 text-center">
                <div className="flex items-center space-x-1">
                     <span
                      className={`font-bold text-sm ${
                        isSelected ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {version.version}
                    </span>
                    {version.isBranch && <BranchesOutlined className="text-orange-500 text-xs" />}
                </div>
               
                <span className="text-xs text-gray-500 mt-0.5">{version.date}</span>
                
                <div className="flex gap-1 mt-1 justify-center flex-wrap">
                    {version.status === "Deprecated" && (
                    <Tag color="error" className="m-0 text-[10px] px-1 scale-90">
                        废弃
                    </Tag>
                    )}
                     {isSelected && (
                         <div className="mt-1">
                             <Dropdown menu={{ items: getMenuItems(version) }} trigger={['click', 'hover']}>
                                <Button type="text" size="small" icon={<span className="text-blue-500 text-xs">操作 <MoreOutlined /></span>} />
                            </Dropdown>
                         </div>
                     )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Button */}
        <div className="relative z-10 flex flex-col items-center" style={{ width: 60, marginLeft: 20 }}>
          <Tooltip title="添加新版本">
            <Button
                type="text"
                shape="circle"
                icon={<PlusOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                onClick={onAddVersion}
                className="bg-white hover:bg-gray-50"
            />
          </Tooltip>
          <span className="mt-2 text-xs text-gray-500">今天</span>
        </div>
      </div>
    </div>
  );
};

export default VersionTimeline;
