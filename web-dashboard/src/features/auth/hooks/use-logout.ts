import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api";
import { authKeys } from "./use-session";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.removeQueries({ queryKey: authKeys.all }),
  });
}
