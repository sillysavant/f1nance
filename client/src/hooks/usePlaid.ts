// import useSWR from "swr";

// const fetcher = (url: string, opts?: RequestInit) =>
//   fetch(url, opts).then((r) => r.json());

export async function createLinkToken(clientUserId: string) {
  const res = await fetch("/api/plaid/create_link_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_user_id: clientUserId }),
  });
  return res.json();
}

export async function exchangePublicToken(publicToken: string) {
  const res = await fetch("/api/plaid/exchange_public_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_token: publicToken }),
  });
  return res.json();
}
