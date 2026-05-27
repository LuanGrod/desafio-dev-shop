export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000")
  .replace(/\/$/, "");

export const FALLBACK_ERROR_MESSAGE = "Houve um erro inesperado. Por favor, tente novamente.";

export type ApiErrorBody = {
  message?: unknown;
};

export class GenericApiError extends Error {
  readonly status?: number;

  constructor(name: string, message = FALLBACK_ERROR_MESSAGE, status?: number) {
    super(message);
    this.name = name;
    this.status = status;
  }
}

export function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function isSafeUserMessage(message: unknown): message is string {
  if (typeof message !== "string") {
    return false;
  }

  const trimmedMessage = message.trim();
  const technicalPattern =
    /(?:stack trace|exception|syntaxerror|referenceerror|typeerror|typeorm|prisma|nestjs|internal server error|^error:|\bat\s+\S+\s+\()/i;

  return (
    trimmedMessage.length > 0 &&
    trimmedMessage.length <= 220 &&
    !technicalPattern.test(trimmedMessage)
  );
}

export function extractUserMessage(body: unknown, fallbackMessage: string) {
  const message = (body as ApiErrorBody | null)?.message;

  return isSafeUserMessage(message)
    ? message.trim()
    : fallbackMessage;
}