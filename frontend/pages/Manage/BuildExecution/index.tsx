import React from "react";
import { Card, Button } from "antd";

const BuildExecutionPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card title="Build Execution">
        <div className="flex gap-3">
          <Button type="primary">Start Build</Button>
          <Button>Cancel</Button>
        </div>
      </Card>
    </div>
  );
};

export default BuildExecutionPage;
