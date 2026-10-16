import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useEnergyBalance(wallet: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["energy", "balance", wallet],
    queryFn: async () => {
      if (!actor || !wallet) return 0n;
      return actor.getEnergyBalance(wallet);
    },
    enabled: !!actor && !isFetching && !!wallet,
  });
}

export function useEnergyHistory(wallet: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["energy", "history", wallet],
    queryFn: async () => {
      if (!actor || !wallet) return [];
      return actor.getEnergyHistory(wallet);
    },
    enabled: !!actor && !isFetching && !!wallet,
  });
}

export function useRechargeEnergy() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (wallet: string) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.rechargeEnergy(wallet);
    },
    onSuccess: (_balance, wallet) => {
      void queryClient.invalidateQueries({
        queryKey: ["energy", "balance", wallet],
      });
      void queryClient.invalidateQueries({
        queryKey: ["energy", "history", wallet],
      });
    },
  });
}

export function useRunAiTask() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (wallet: string) => {
      if (!actor) throw new Error("El backend no está listo");
      return actor.runAiTask(wallet);
    },
    onSuccess: (_result, wallet) => {
      void queryClient.invalidateQueries({
        queryKey: ["energy", "balance", wallet],
      });
      void queryClient.invalidateQueries({
        queryKey: ["energy", "history", wallet],
      });
    },
  });
}
