import { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DatabaseError() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Unable to connect to the database"
  );

  useEffect(() => {
    checkDBConnection();
    const interval = setInterval(checkDBConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkDBConnection = async () => {
    try {
      const response = await fetch("/api/db-status");
      const data = await response.json();

      if (data.connected) {
        // DB is now connected, reload the page
        window.location.reload();
      } else {
        setErrorMessage(data.error || "Database connection unavailable");
      }
    } catch (error) {
      setErrorMessage(
        "Failed to check database status. Please ensure the server is running."
      );
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkDBConnection();
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-rose-100 flex items-center justify-center p-4">
      {/* Background Blur Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-rose-500 rounded-full p-4">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold text-red-900 mb-2">
            Database Connection Error
          </h1>

          {/* Error Description */}
          <p className="text-gray-600 mb-6">
            Unable to connect to the database. The application cannot proceed without
            database access.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-red-900 mb-2">Error Details:</p>
            <p className="text-sm text-red-700 font-mono break-words">
              {errorMessage}
            </p>
          </div>

          {/* Status Check Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              The system is automatically checking the database connection every 5 seconds.
              It will automatically reload once the connection is restored.
            </p>
          </div>

          {/* Retry Button */}
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Checking..." : "Retry Connection"}
          </Button>

          {/* Back Button */}
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full mt-3 border-red-300 text-red-700 hover:bg-red-50"
          >
            Go Back
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Please contact your system administrator if this issue persists.</p>
        </div>
      </div>
    </div>
  );
}
