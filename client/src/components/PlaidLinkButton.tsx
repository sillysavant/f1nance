"use client";

import React from "react";
import { createLinkToken, exchangePublicToken } from "../hooks/usePlaid";

// Define Plaid types (basic subset)
interface PlaidHandler {
  open: () => void;
}

interface PlaidMetadata {
  institution?: {
    name: string;
    institution_id: string;
  };
  accounts?: Array<{
    id: string;
    name: string;
    type: string;
    subtype?: string;
  }>;
}

declare global {
  interface Window {
    Plaid: {
      create: (config: {
        token: string;
        onSuccess: (public_token: string, metadata: PlaidMetadata) => void;
        onExit: (err: Error | null, metadata: PlaidMetadata) => void;
      }) => PlaidHandler;
    };
  }
}

export default function PlaidLinkButton({
  clientUserId,
}: {
  clientUserId: string;
}) {
  const handleClick = async () => {
    try {
      const tokenResp = await createLinkToken(clientUserId);
      const linkToken = tokenResp?.link_token;
      if (!linkToken) {
        alert("Failed to get link token");
        return;
      }

      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: async (public_token) => {
          const exchange = await exchangePublicToken(public_token);
          console.log("Plaid exchange result:", exchange);
          alert("Plaid link completed! Check server logs.");
        },
        onExit: (err, metadata) => {
          if (err) console.error("Plaid exited with error:", err);
          console.log("Plaid exit metadata:", metadata);
        },
      });

      handler.open();
    } catch (error) {
      console.error("Plaid link error:", error);
      alert("Something went wrong with Plaid link");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Link Bank Account (Plaid Sandbox)
    </button>
  );
}
