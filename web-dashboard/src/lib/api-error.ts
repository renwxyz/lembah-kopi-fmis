export interface ApiProblem {
  detail?: string;
  status?: number;
  title?: string;
  type?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly problem?: ApiProblem,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getApiError(response: Response): Promise<ApiError> {
  const fallback = "Terjadi kesalahan saat memproses permintaan.";
  let problem: ApiProblem | undefined;

  try {
    problem = (await response.json()) as ApiProblem;
  } catch {
    // Upstream errors should normally follow RFC 9457, but retain a safe fallback.
  }

  return new ApiError(problem?.detail ?? problem?.title ?? fallback, response.status, problem);
}
