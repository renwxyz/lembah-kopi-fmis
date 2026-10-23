import { useQuery } from "@tanstack/react-query";
import { getSession } from "../api";

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
