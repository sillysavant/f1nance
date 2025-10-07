import { LucideIcon } from "lucide-react";
import React from "react";

interface NavItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: LucideIcon;
}

const NavItem: React.FC<NavItemProps> = ({ label, isActive, onClick }) => (
  <div
    className={`w-5/6 px-4 cursor-pointer text-xl hover:bg-active-nav-bg py-3 rounded-lg font-medium ${
      isActive
        ? "bg-active-nav-bg/25 text-active-nav-text"
        : "bg-transparent text-nav-text"
    }`}
    onClick={onClick}
  >
    <div></div>
    <div>{label}</div>
  </div>
);

export default NavItem;
