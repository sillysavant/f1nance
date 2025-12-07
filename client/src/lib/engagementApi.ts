import axios from "axios";

const API_BASE = "/api/v1/engagements";

interface EngagementResponse {
  id: number;
  module_name: string;
  action: string;
  timestamp: string;
  critical_date?: string | null;
  snoozed_until?: string | null;
  is_done: boolean;
}

// Fetch all engagements for current user
export const getEngagements = async (): Promise<EngagementResponse[]> => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_BASE, { headers: { Authorization: `Bearer ${token}` } });
  return Array.isArray(res.data) ? res.data : [];
};

// Mark done
export const markDone = async (id: number) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_BASE}/${id}/done`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

// Snooze engagement
export const snoozeEngagement = async (id: number, snoozedUntil: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_BASE}/${id}/snooze`, { snoozed_until: snoozedUntil }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};
