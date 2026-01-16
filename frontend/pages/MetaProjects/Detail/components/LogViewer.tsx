import React, { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import { List, ListImperativeAPI } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import {
  Input,
  Button,
  Space,
  Progress,
  Tooltip,
  theme,
  Tag,
} from 'antd';
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  VerticalAlignBottomOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';

interface LogViewerProps {
  logs: string[];
  onClear: () => void;
  isPaused: boolean;
  onPauseToggle: (paused: boolean) => void;
}

interface ParsedLog {
  id: number;
  original: string;
  timestamp: string;
  timestampValue: number;
  level: 'info' | 'error' | 'warn' | 'success' | 'progress';
  message: string;
  progress?: number;
}

const ROW_HEIGHT = 28; // Increased slightly for Tag

const parseLog = (log: string, index: number): ParsedLog => {
  // Regex to extract timestamp [YYYY-MM-DD...] and event [type]
  const match = log.match(/^\[(.*?)\] \[(.*?)\] (.*)$/);
  
  if (match) {
    const [, timestamp, event, message] = match;
    let level: ParsedLog['level'] = 'info';
    let progress: number | undefined = undefined;

    const lowerMsg = message.toLowerCase();
    const lowerEvent = event.toLowerCase();

    if (lowerEvent.includes('error') || lowerMsg.includes('error') || lowerMsg.includes('fail')) {
      level = 'error';
    } else if (lowerEvent.includes('warn') || lowerMsg.includes('warn')) {
      level = 'warn';
    } else if (lowerEvent.includes('success') || lowerMsg.includes('success') || lowerMsg.includes('done')) {
      level = 'success';
    }

    // Git progress detection
    const progressMatch = message.match(/(\d+)%/);
    if (progressMatch) {
      level = 'progress';
      progress = parseInt(progressMatch[1], 10);
    }

    // Try to parse timestamp
    let timestampValue = 0;
    try {
      // Support ISO-like strings or just append date if only time provided
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        timestampValue = d.getTime();
      } else {
        // Fallback for HH:mm:ss format
        const d2 = new Date(`1970-01-01T${timestamp}`);
        if (!isNaN(d2.getTime())) {
          timestampValue = d2.getTime();
        }
      }
    } catch (e) {
      // ignore parsing error
    }

    return { id: index, original: log, timestamp, timestampValue, level, message, progress };
  }

  return {
    id: index,
    original: log,
    timestamp: '',
    timestampValue: 0,
    level: 'info',
    message: log,
  };
};

// Extracted Row component for performance
const LogRow = memo((props: any) => {
  const { index, style, data } = props;
  // console.log('LogRow render', index, !!data);
  const log = data?.[index];
  const { token } = theme.useToken();
  
  if (!log) return null; // Safety check

  let color = token.colorText; // Default text
  let tagColor = 'default';
  let tagText = 'INFO';

  if (log.level === 'error') {
    color = token.colorError;
    tagColor = 'error';
    tagText = 'ERROR';
  }
  if (log.level === 'warn') {
    color = token.colorWarning;
    tagColor = 'warning';
    tagText = 'WARN';
  }
  if (log.level === 'success') {
    color = token.colorSuccess;
    tagColor = 'success';
    tagText = 'SUCCESS';
  }
  if (log.level === 'progress') {
    color = token.colorPrimary;
    tagColor = 'processing';
    tagText = 'PROGRESS';
  }

  return (
    <div style={{ ...style, lineHeight: `${ROW_HEIGHT}px`, padding: '0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color }}>
      <Space size={8} align="center">
        {log.timestamp && <span style={{ color: token.colorTextSecondary, fontSize: '0.85em', minWidth: 140 }}>[{log.timestamp}]</span>}
        <Tag color={tagColor} bordered={false} style={{ margin: 0, fontSize: 10, lineHeight: '18px' }}>{tagText}</Tag>
        <span style={{ color }}>{log.message}</span>
      </Space>
    </div>
  );
});

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  onClear,
  isPaused,
  onPauseToggle,
}) => {
  const { token } = theme.useToken();
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProgressLogs, setShowProgressLogs] = useState(true);
  const listRef = useRef<ListImperativeAPI>(null);

  // 1. Parse and Filter Logs
  const { filteredLogs, progressState } = useMemo(() => {
    let latestProgress = 0;
    let latestProgressMsg = '';
    
    // For ETA calculation
    let firstProgressTime = 0;
    let firstProgressVal = 0;
    let lastProgressTime = 0;
    let lastProgressVal = 0;
    
    const parsed: ParsedLog[] = [];

    logs.forEach((log, index) => {
      const p = parseLog(log, index);
      
      // Track global progress & ETA
      if (p.level === 'progress' && p.progress !== undefined) {
        latestProgress = p.progress;
        latestProgressMsg = p.message;
        
        if (p.timestampValue > 0) {
          if (firstProgressTime === 0) {
            firstProgressTime = p.timestampValue;
            firstProgressVal = p.progress;
          }
          lastProgressTime = p.timestampValue;
          lastProgressVal = p.progress;
        }
      }

      // Filter by Search
      if (searchQuery && !p.original.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      // Filter Progress Logs (Folding)
      if (!showProgressLogs && p.level === 'progress') {
        return;
      }

      parsed.push(p);
    });

    console.log('Filtered logs:', parsed.length);
    // Calculate ETA
    let eta = '';
    if (latestProgress < 100 && latestProgress > 0 && lastProgressTime > firstProgressTime && lastProgressVal > firstProgressVal) {
      const timeDiff = lastProgressTime - firstProgressTime;
      const progDiff = lastProgressVal - firstProgressVal;
      const rate = progDiff / timeDiff; // percent per ms
      const remainingPercent = 100 - latestProgress;
      const remainingTimeMs = remainingPercent / rate;
      
      // Format to MM:ss or HH:mm:ss
      const totalSeconds = Math.floor(remainingTimeMs / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      eta = `${m}m ${s}s`;
    }

    return {
      filteredLogs: parsed,
      progressState: { percent: latestProgress, message: latestProgressMsg, eta },
    };
  }, [logs, searchQuery, showProgressLogs]);

  // 2. Auto-Scroll Logic
  useEffect(() => {
    if (autoScroll && listRef.current && filteredLogs.length > 0) {
      // Use a small timeout to ensure render is complete
      setTimeout(() => {
        // v1 uses scrollToItem
        listRef.current?.scrollToItem(filteredLogs.length - 1, 'end');
      }, 50);
    }
  }, [filteredLogs.length, autoScroll]);

  // 3. Handle Scroll to detect manual intervention
  const lastScrollTop = useRef(0);
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Simple heuristic: if scrolling up significantly, pause auto-scroll
    if (scrollTop < lastScrollTop.current - 5) { // -5 buffer
      setAutoScroll(false);
    }
    lastScrollTop.current = scrollTop;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 8 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索日志..."
            size="small"
            style={{ width: 200 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
          <Tooltip title={isPaused ? "继续日志更新" : "暂停日志更新"}>
            <Button
              type={isPaused ? "primary" : "default"}
              size="small"
              icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
              onClick={() => onPauseToggle(!isPaused)}
            />
          </Tooltip>
          <Tooltip title="清除日志">
            <Button size="small" icon={<DeleteOutlined />} onClick={onClear} />
          </Tooltip>
          <Tooltip title={showProgressLogs ? "折叠进度日志" : "展开进度日志"}>
             <Button 
                size="small" 
                type={!showProgressLogs ? 'primary' : 'default'}
                icon={showProgressLogs ? <DownOutlined /> : <RightOutlined />}
                onClick={() => setShowProgressLogs(!showProgressLogs)}
             >
               进度日志
             </Button>
          </Tooltip>
        </Space>
        
        {/* Progress Bar Display */}
        {progressState.percent > 0 && (
           <div style={{ flex: 1, maxWidth: 400, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
             {progressState.eta && (
               <span style={{ fontSize: 12, color: token.colorTextSecondary, whiteSpace: 'nowrap' }}>
                 Remaining: {progressState.eta}
               </span>
             )}
             <Progress 
                percent={progressState.percent} 
                size="small" 
                steps={10} 
                strokeColor={token.colorSuccess} 
                style={{ width: 200 }}
             />
           </div>
        )}
      </div>

      {/* Main Log Area */}
      <div style={{ 
        flex: 1, 
        border: `1px solid ${token.colorBorder}`, 
        borderRadius: token.borderRadius, 
        backgroundColor: token.colorFillQuaternary, // Darker background from theme
        position: 'relative',
        color: token.colorText
      }}>
        <AutoSizer renderProp={({ height, width }) => {
            console.log('AutoSizer dims:', height, width);
            if (!height || !width) {
               return <div style={{ padding: 16, color: token.colorTextSecondary }}>Initializing...</div>;
            }
            return (
              <List
                listRef={listRef}
                style={{ height: height!, width: width!, overflowX: 'hidden' }}
                rowCount={filteredLogs.length}
                rowHeight={ROW_HEIGHT}
                rowProps={{ data: filteredLogs }}
                rowComponent={LogRow}
                onScroll={handleScroll as any}
              />
            );
          }} />

        {/* Scroll to Bottom Button */}
        {!autoScroll && (
          <Button
            type="primary"
            shape="circle"
            icon={<VerticalAlignBottomOutlined />}
            style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}
            onClick={() => {
              setAutoScroll(true);
              listRef.current?.scrollToItem(filteredLogs.length - 1, 'end');
            }}
          />
        )}
      </div>
      
      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: token.colorTextSecondary }}>
        <span>Total Lines: {logs.length} (Filtered: {filteredLogs.length})</span>
        <span>{autoScroll ? 'Auto-scrolling' : 'Scroll paused'}</span>
      </div>
    </div>
  );
};
