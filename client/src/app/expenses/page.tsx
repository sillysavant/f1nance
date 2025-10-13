"use client";
import React from "react";
import NavBar from "@/components/NavBar";

export default function HomePage() {
  return (
    <div className="flex h-full bg-background">
      <NavBar />
      <main className="flex ml-1 p-1">
        <div>Expenses</div>
      </main>
    </div>
  );
}
