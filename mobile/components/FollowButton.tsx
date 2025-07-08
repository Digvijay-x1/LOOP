import { Text, TouchableOpacity } from 'react-native';
import { useFollow } from '../hooks/useFollow';
import { User } from '@/types';
import React from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface FollowButtonProps {
  user: User;
}

const FollowButton: React.FC<FollowButtonProps> = ({ user }) => {
  const { currentUser } = useCurrentUser();
  const { handleFollow, followUserMutation, isFollowing } = useFollow(user._id);
  
  const isLoading = followUserMutation.isPending;
  
  // Don't render the button if this is the current user
  if (currentUser && currentUser._id === user._id) {
    return null;
  }
  
  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full ${isFollowing ? 'bg-white border border-gray-300' : 'bg-black'}`}
      onPress={handleFollow}
      disabled={isLoading}
    >
      <Text 
        className={`font-semibold ${isFollowing ? 'text-black' : 'text-white'}`}
      >
        {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
};

export default FollowButton;