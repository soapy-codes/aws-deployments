"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { translateApi } from "@/lib";
import { TranslatePrimaryKey, TranslateRequest } from "@a2t/shared-types";
import { useApp } from "@/components";

export const useTranslate = () => {
  const { user, setError, setSelectedTranslation } = useApp();
  const queryClient = useQueryClient();
  const queryKey = ["translate", user ? user.userId : ""];

  const translateQuery = useQuery({
    queryKey,
    queryFn: () => {
      console.log("Do the translate query fn");
      if (!user) {
        return [];
      }
      return translateApi.getUserTranslations();
    },
  });

  const translateMutation = useMutation({
    mutationFn: (request: TranslateRequest) => {
      if (user) {
        return translateApi.translateUserText(request);
      } else {
        return translateApi.translatePublicText(request);
      }
    },

    onSuccess: (result) => {
      if (translateQuery.data) {
        queryClient.setQueryData(
          queryKey,
          translateQuery.data.concat([result])
        );
      }
      setSelectedTranslation(result);
    },
    onError: (error) => {
      setError(error.toString());
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: TranslatePrimaryKey) => {
      if (!user) {
        throw new Error("user is not logged in");
      }

      return translateApi.deleteUserTranslation(key);
    },
    onSuccess: (result) => {
      if (!translateQuery.data) {
        return;
      }
      queryClient.setQueryData(
        queryKey,
        translateQuery.data.filter((item) => {
          return item.requestId !== result.requestId;
        })
      );
    },
  });

  return {
    translations: !translateQuery.data ? [] : translateQuery.data,
    isLoading: translateQuery.status === "pending",
    translate: translateMutation.mutate,
    isTranslating: translateMutation.status === "pending",
    deleteTranslation: deleteMutation.mutate,
    isDeleting: deleteMutation.status === "pending",
  };
};
