import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const Loading: React.FC = () => (
  <div style={{ 
    width: "100%", 
    height: "100vh", 
    backgroundColor: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
  </div>
);

export default Loading;
