import { useApiClient, userApi } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export const useUserProfile = (username?: string) => {
  const api = useApiClient();

  const {
    data: userProfile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: () => username ? userApi.getUserProfileByUserName(api, username) : null,
    select: (response) => response?.data?.user as User,
    enabled: !!username, // Only run the query if username is provided
  });

  return { 
    userProfile, 
    isLoading, 
    error, 
    refetch 
  };
}; 