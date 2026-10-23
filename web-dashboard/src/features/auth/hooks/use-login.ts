import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api";
import { authKeys } from "./use-session";
import type { LoginInput } from "../types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.session(), user);
    },
  });
}
