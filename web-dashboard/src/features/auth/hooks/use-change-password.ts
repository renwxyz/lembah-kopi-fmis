import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../api";
import type { ChangePasswordInput } from "../types";

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
  });
}

