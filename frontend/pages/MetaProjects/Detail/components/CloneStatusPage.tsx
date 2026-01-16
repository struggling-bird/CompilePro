import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Alert, Button, message } from 'antd';
import { useSocket } from '@/contexts/SocketContext';
import { getCloneLogs, retryClone } from '@/services/metaprojects';
import { LogViewer } from './LogViewer';

const { Title } = Typography;

interface Props {
  projectId: string;
  onSuccess: () => void;
}

const CloneStatusPage: React.FC<Props> = ({ projectId, onSuccess }) => {
  const { socket } = useSocket();
  const [logs, setLogs] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // Buffer for logs received while paused
  const bufferRef = useRef<string[]>([]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
    if (!isPaused && bufferRef.current.length > 0) {
      setLogs((prev) => [...prev, ...bufferRef.current]);
      bufferRef.current = [];
    }
  }, [isPaused]);

  useEffect(() => {
    // Join room
    if (socket) {
      socket.emit('join', `room:project:${projectId}`);
    }

    // Listen for logs
    const handleLog = (data: any) => {
      // data: { event, message, timestamp }
      const line = `[${data.timestamp}] [${data.event}] ${data.message}`;
      if (isPausedRef.current) {
        bufferRef.current.push(line);
      } else {
        setLogs((prev) => [...prev, line]);
      }
      if (data.event === 'clone:error' || data.status === 'error') {
          setIsError(true);
      }
    };

    const handleSuccess = () => {
      onSuccess();
    };

    const handleError = (data: any) => {
      const msg = `[ERROR] ${data.message}`;
      if (isPausedRef.current) {
        bufferRef.current.push(msg);
      } else {
        setLogs((prev) => [...prev, msg]);
      }
      setIsError(true);
    };

    if (socket) {
      socket.on('clone:log', handleLog);
      socket.on('clone:success', handleSuccess);
      socket.on('clone:error', handleError);
    }

    return () => {
      if (socket) {
        socket.emit('leave', `room:project:${projectId}`);
        socket.off('clone:log', handleLog);
        socket.off('clone:success', handleSuccess);
        socket.off('clone:error', handleError);
      }
    };
  }, [socket, projectId, onSuccess]);

  useEffect(() => {
    // Load initial logs
    getCloneLogs(projectId)
      .then((res) => {
        const initialLogs = res.list.map((l) => {
          try {
            const parsed = JSON.parse(l);
            if (parsed.status === 'error' || parsed.event === 'clone:error') setIsError(true);
            return `[${parsed.timestamp}] [${parsed.event}] ${parsed.message}`;
          } catch {
            return l;
          }
        });
        setLogs(initialLogs);
      })
      .catch(console.error);
  }, [projectId]);

  const handleRetry = async () => {
      try {
          await retryClone(projectId);
          message.success('已重新发起克隆');
          setIsError(false);
          setLogs([]);
          bufferRef.current = [];
      } catch (e: any) {
          message.error(e.message || '重试失败');
      }
  };

  return (
    <Card 
      style={{ margin: 24, height: 'calc(100vh - 100px)' }}
      styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>项目初始化中 (Cloning...)</Title>
        {isError && <Button type="primary" danger onClick={handleRetry}>重新尝试</Button>}
      </div>
      <Alert
        message={isError ? "克隆失败，请查看日志并重试" : "正在从 Git 仓库克隆代码，请稍候..."}
        type={isError ? "error" : "info"}
        showIcon
        style={{ marginBottom: 16 }}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <LogViewer 
          logs={logs} 
          onClear={() => setLogs([])}
          isPaused={isPaused}
          onPauseToggle={setIsPaused}
        />
      </div>
    </Card>
  );
};

export default CloneStatusPage;
