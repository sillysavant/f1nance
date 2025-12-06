// src/lib/currencyApi.ts
export interface CurrencyRecord {
    title: string;
    description: string;
    status: "traced" | "warning" | "verified";
    date: string;
  }
  
  /**
   * Fetch traced currency rates from backend.
   * @param base Base currency (e.g., "USD")
   * @param targets Comma-separated target currencies (e.g., "EUR,KES,GBP")
   */
  export const getCurrencyTracing = async (
    base: string,
    targets: string
  ): Promise<CurrencyRecord[]> => {
    try {
      const query = new URLSearchParams({ base, targets }).toString();
      const res = await fetch(
        `http://localhost:8000/api/v1/currency-tracing?${query}`
      );
  
      if (!res.ok) {
        console.error("Currency tracing fetch failed:", res.statusText);
        return [];
      }
  
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        return data.records;
      }
  
      return [];
    } catch (err) {
      console.error("Error fetching currency tracing:", err);
      return [];
    }
  };
  