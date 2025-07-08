import React from 'react';
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePosts } from '@/hooks/usePosts';
import PostsList from '@/components/PostsList';
import FollowButton from '@/components/FollowButton';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const UserProfileScreen = () => {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { userProfile, isLoading } = useUserProfile(username);
  const { currentUser } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isLoadingPosts,
  } = usePosts(username);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-xl font-bold text-gray-900 mb-2">User not found</Text>
          <Text className="text-gray-500 text-center mb-4">
            The user @{username} doesnot exist or has been removed.
          </Text>
          <TouchableOpacity
            className="bg-black px-4 py-2 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentUser = currentUser && currentUser._id === userProfile._id;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {userProfile.firstName} {userProfile.lastName}
            </Text>
            <Text className="text-gray-500 text-sm">{userPosts?.length || 0} Posts</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{
            uri:
              userProfile.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="px-4 pb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              source={{ 
                uri: userProfile.profilePicture || 
                'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
              }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            {!isCurrentUser && <FollowButton user={userProfile} />}
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-bold text-gray-900 mr-1">
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#1DA1F2" />
            </View>
            <Text className="text-gray-500 mb-2">@{userProfile.username}</Text>
            <Text className="text-gray-900 mb-3">{userProfile.bio || "No bio available"}</Text>

            {userProfile.location && (
              <View className="flex-row items-center mb-2">
                <Feather name="map-pin" size={16} color="#657786" />
                <Text className="text-gray-500 ml-2">{userProfile.location}</Text>
              </View>
            )}

            {userProfile.createdAt && (
              <View className="flex-row items-center mb-3">
                <Feather name="calendar" size={16} color="#657786" />
                <Text className="text-gray-500 ml-2">
                  Joined {format(new Date(userProfile.createdAt), "MMMM yyyy")}
                </Text>
              </View>
            )}

            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{userProfile.following?.length || 0}</Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold">{userProfile.followers?.length || 0}</Text>
                  <Text className="text-gray-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PostsList username={userProfile.username} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen; 