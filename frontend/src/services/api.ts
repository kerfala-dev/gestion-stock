
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    message?: string;
  }>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || result?.success !== true) {
    const details = result?.errors
      ?.map((item) => item.message)
      .filter(Boolean)
      .join(", ");

    throw new Error(
      result?.message ||
        details ||
        `Erreur HTTP ${response.status}`
    );
  }

  return result.data as T;
}
