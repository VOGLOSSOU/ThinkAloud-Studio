import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { episodesApi } from "@/api/client";
import type { Episode } from "@/types";

export function useEpisodes() {
  return useQuery<Episode[]>({
    queryKey: ["episodes"],
    queryFn: episodesApi.list,
  });
}

export function useEpisode(id: string | undefined) {
  return useQuery<Episode>({
    queryKey: ["episodes", id],
    queryFn: () => episodesApi.get(id!),
    enabled: !!id,
  });
}

export function useUpdateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      episodesApi.update(id, data),
    onSuccess: (updated: Episode) => {
      queryClient.setQueryData(["episodes", updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });
}
