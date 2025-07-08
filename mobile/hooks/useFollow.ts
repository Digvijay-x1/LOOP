import { useApiClient, userApi } from "@/utils/api";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";

export const useFollow = (userId?: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  // Check if the current user is already following the target user
  useEffect(() => {
    if (currentUser && userId) {
      const isAlreadyFollowing = currentUser.following?.includes(userId);
      setIsFollowing(isAlreadyFollowing || false);
    }
  }, [currentUser, userId]);

  const followUserMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      try {
        const response = await userApi.followUser(api, targetUserId);
        return response.data;
      } catch (error) {
        console.error("Follow error:", error);
        throw error;
      }
    },
    onSuccess: (data, targetUserId) => {
      // Toggle following state
      setIsFollowing(prev => !prev);
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({queryKey: ["user", targetUserId]});
      queryClient.invalidateQueries({queryKey: ["authUser"]});
    },
    onError: (error) => {
      console.error("Follow mutation error:", error);
    }
  });

  const handleFollow = () => {
    if (userId) {
      followUserMutation.mutate(userId);
    }
  };

  return {
    handleFollow,
    followUserMutation,
    isFollowing
  };
};