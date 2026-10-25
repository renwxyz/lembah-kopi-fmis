import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setLahanPolygon, deleteLahanPolygon } from "../api";
import { lahanKeys } from "./use-lahan-list";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard-overview";
import type { GeoJsonPolygon } from "../types";

export function useSetLahanPolygon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, polygon }: { id: string; polygon: GeoJsonPolygon }) =>
      setLahanPolygon(id, polygon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lahanKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useDeleteLahanPolygon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLahanPolygon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lahanKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

