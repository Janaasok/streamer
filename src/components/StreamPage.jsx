import React from "react";
import { useParams } from "react-router-dom";

const StreamPage = () => {
  const { serverId } = useParams();

  return (
    <div style={{ backgroundColor: "#1e1e1e", height: "100vh", color: "white", padding: "2rem" }}>
      <h1>Streaming on Server: {serverId}</h1>

      {}
      <div style={{
        width: "80%",
        height: "60vh",
        backgroundColor: "#333",
        borderRadius: "10px",
        marginTop: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <p style={{ color: "#aaa" }}>Stream will appear here...</p>
      </div>
    </div>
  );
};

export default StreamPage;
