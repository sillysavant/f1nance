import React, { useState } from "react";
import Image from "next/image";

import NavItem from "./NavItem";
import { NAV_ITEMS } from "../constants/navItems";

export default function Navbar() {
  const [selected, setSelected] = useState("dashboard");

  return (
    <nav className="bg-white h-screen flex flex-col justify-between items-center fixed left-0 top-0 shadow-navbar w-65 lg:w-60 md:w-30 hidden-sm:flex">
      <div className="flex flex-col w-full items-center gap-18">
        <div className="w-9/10 flex items-center justify-center ">
          <Image
            src="/logo.png"
            alt="Logo"
            width={240}
            height={0}
            className="h-auto"
          />
        </div>
        {/* Nav items centered vertically */}
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              label={item.label}
              isActive={selected === item.key}
              onClick={() => setSelected(item.key)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
