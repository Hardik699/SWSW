import { useEffect, useState } from "react";
import DatabaseError from "@/pages/DatabaseError";

interface DBStatus {
  connected: boolean;
  error?: string;
}

export function AppWithDBCheck({ children }: { children: React.ReactNode }) {
  const [dbStatus, setDBStatus] = useState<DBStatus | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkDBStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch("/api/db-status", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        setDBStatus(data);
      } catch (error) {
        console.error("Failed to check DB status:", error);
        // Assume database is connected if we can't reach the API
        // This allows the app to load even if the status check fails
        setDBStatus({
          connected: true,
          error: undefined,
        });
      } finally {
        setHasChecked(true);
      }
    };

    // Check immediately with a short delay
    const timer = setTimeout(checkDBStatus, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Show error page ONLY if we've checked and database is explicitly not connected
  if (hasChecked && dbStatus && !dbStatus.connected) {
    return <DatabaseError />;
  }

  // Show app - either still loading or database is connected
  return <>{children}</>;
}
