import React, { useState } from "react";
import NavItem from "./NavItem";

const navItems = [
  { label: "Dashboard", key: "dashboard" },
  { label: "Expenses", key: "expenses" },
  { label: "Notifications", key: "notifications" },
  { label: "AI Advisor", key: "ai-advisor" },
  { label: "Settings", key: "settings" },
];

export default function Navbar() {
  const [selected, setSelected] = useState("dashboard");

  return (
    <nav
      style={{
        width: "20vw",
        minWidth: 200,
        maxWidth: 320,
        background: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "fixed",
        left: 0,
        top: 0,
        boxShadow: "1px 0 0 #e5e7eb",
      }}
    >
      {/* Logo placeholder */}
      <div
        style={{
          height: 80,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Logo goes here */}
      </div>
      {/* Nav items centered vertically */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {navItems.map((item) => (
          <NavItem
            key={item.key}
            label={item.label}
            isActive={selected === item.key}
            onClick={() => setSelected(item.key)}
          />
        ))}
      </div>
    </nav>
  );
}
