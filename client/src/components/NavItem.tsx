import React from "react";

interface NavItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
}

const NavItem: React.FC<NavItemProps> = ({
  label,
  isActive,
  onClick,
  icon: Icon,
}) => (
  <div
    className={`w-5/6 px-4 cursor-pointer text-xl hover:bg-active-nav-bg py-3 rounded-lg font-medium flex items-center gap-3 ${
      isActive
        ? "bg-active-nav-bg/25 text-active-nav-text"
        : "bg-transparent text-nav-text"
    }`}
    onClick={onClick}
  >
    {Icon && <Icon className="w-6 h-6 mr-2" />}
    <span>{label}</span>
  </div>
);

export default NavItem;
