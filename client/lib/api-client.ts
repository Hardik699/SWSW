/**
 * Centralized API client with consistent error handling
 */

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Make an API request with consistent error handling
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error || `API request failed with status ${response.status}`,
        errorData
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof TypeError) {
      if (error.message === "Failed to fetch") {
        throw new APIError(
          0,
          "Network error: Unable to reach the server. Please check your connection.",
          error
        );
      }
      throw new APIError(0, error.message, error);
    }

    throw new APIError(
      500,
      "Unexpected error occurred",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Get multiple API endpoints in parallel with fallback
 */
export async function getMultipleEndpoints<T extends Record<string, any>>(
  endpoints: Record<keyof T, string>
): Promise<T> {
  const results = {} as T;
  const errors: Record<string, string> = {};

  const responses = await Promise.all(
    Object.entries(endpoints).map(([key, url]) =>
      apiCall(url)
        .then((data) => ({ key, data, error: null }))
        .catch((error) => ({
          key,
          data: null,
          error: error instanceof APIError ? error.message : String(error),
        }))
    )
  );

  responses.forEach((response) => {
    const key = response.key as keyof T;
    if (response.error) {
      errors[String(key)] = response.error;
      results[key] = { success: false, data: [] } as any;
    } else {
      results[key] = response.data;
    }
  });

  if (Object.keys(errors).length > 0) {
    console.warn("Some API endpoints failed:", errors);
  }

  return results;
}
