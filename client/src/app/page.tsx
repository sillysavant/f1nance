"use client";
import React from "react";
import NavBar from "../components/NavBar";

export default function HomePage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB" }}>
      <NavBar />
      <main className="flex ml-1 p-1">
        <div className="w-full h-auto bg-notification-badge-bg/50 flex justify-between items-center">
          <div></div>
        </div>
        <div></div>
      </main>
    </div>
  );
}
