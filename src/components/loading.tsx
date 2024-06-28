import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const Loading: React.FC = () => (
  <div style={{ width: "100%", height: "100%", backgroundColor: "#ffffff" }}>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
  </div>
);

export default Loading;
