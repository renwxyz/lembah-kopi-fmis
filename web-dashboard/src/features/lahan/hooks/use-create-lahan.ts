import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLahan } from "../api";
import { lahanKeys } from "./use-lahan-list";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard-overview";
import type { CreateLahanInput } from "../types";

export function useCreateLahan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLahanInput) => createLahan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lahanKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

