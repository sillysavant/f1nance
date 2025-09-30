"use client";
import React from "react";
import NavBar from "../../components/NavBar";

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB" }}>
      <NavBar />
      <main style={{ flex: 1, marginLeft: "20vw", padding: "2rem" }}>
        {/* Dashboard content goes here */}
      </main>
    </div>
  );
}
