"use client";
import React from "react";
import { createLinkToken, exchangePublicToken } from "../hooks/usePlaid";

declare global {
  interface Window {
    Plaid: any;
  }
}

export default function PlaidLinkButton({ clientUserId }: { clientUserId: string }) {
  const handleClick = async () => {
    const tokenResp = await createLinkToken(clientUserId);
    const linkToken = tokenResp.link_token;
    if (!linkToken) return alert("failed to get link token");

    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (public_token: string, metadata: any) => {
        const exchange = await exchangePublicToken(public_token);
        console.log("exchange result", exchange);
        alert("Plaid exchange complete; check server logs");
      },
      onExit: (err: any, metadata: any) => {
        console.log("Plaid exit", err, metadata);
      },
    });
    handler.open();
  };

  return (
    <button onClick={handleClick} className="px-4 py-2 bg-blue-600 text-white rounded">
      Link Bank Account (Plaid Sandbox)
    </button>
  );
}
