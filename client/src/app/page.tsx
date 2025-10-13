"use client";
import React from "react";
import NavBar from "../components/NavBar";

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background w-screen">
      <NavBar />
      {/* let this container grow to fill remaining width beside NavBar */}
      <div className="flex flex-col p-4 py-5 h-full flex-1">
        <div className="w-full h-auto bg-notification-badge-bg/50 text-notification-badge-text flex justify-between items-center px-6 py-2 rounded-lg">
          <div className="flex flex-col">
            <div>Spending habit alert: Dining out 20% above average</div>
            <div>Investing tip: Consider diversifying into ETFs</div>
          </div>
          <div>View all</div>
        </div>
        <div></div>
      </div>
    </div>
  );
}
