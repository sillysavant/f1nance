// src/lib/notificationsApi.ts
export interface Notification {
    title: string;
    message: string;
    type: "payment" | "alert" | "success" | "default";
    date: string;
  }
  
  // Example mock data for testing
  const mockNotifications: Notification[] = [
    {
      title: "Payment Received",
      message: "You received $500 from client Gnadeep",
      type: "payment",
      date: "Nov 16, 2025",
    },
    {
      title: "Budget Alert",
      message: "You are 90% of your monthly budget",
      type: "alert",
      date: "Nov 15, 2025",
    },
    {
      title: "Goal Achieved",
      message: "You reached your financial literacy goal",
      type: "success",
      date: "Nov 14, 2025",
    },
  ];
  
  export const getNotifications = async (): Promise<Notification[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockNotifications), 500);
    });
  };
  