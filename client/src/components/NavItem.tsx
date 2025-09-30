import React from "react";

interface NavItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: isActive ? "#DBEAFE" : "transparent",
      color: isActive ? "#2563EB" : "#374151",
      border: "none",
      outline: "none",
      width: "100%",
      padding: "16px 0",
      fontSize: 18,
      fontWeight: 500,
      cursor: "pointer",
      transition: "background 0.2s, color 0.2s",
    }}
  >
    {label}
  </button>
);

export default NavItem;
