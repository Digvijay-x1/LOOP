import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { userApi, useApiClient } from '@/utils/api';
import { router } from 'expo-router';
import { User } from '@/types';
import FollowButton from '@/components/FollowButton';

// todo: add this screen and made it actually working

const TRENDING_TOPICS = [
    { topic: "#NoBackPolicy" , tweets: "125k" },
    { topic: "#WhoMakeThisApp", tweets: "89k" },
    { topic: "#TwitterClone", tweets: "234k"},
    { topic: "#ChallengingElonMusk" , tweets: "567k"},
    { topic: "TechNews", tweets: "98k"},
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const api = useApiClient();

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setIsLoading(true);
        setShowModal(true);
        const { data } = await userApi.searchUsers(api, searchQuery);
        setSearchResults(data.users || []);
        console.log(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  const navigateToProfile = (username: string) => {
    setShowModal(false);
    router.push({
      pathname: "/profile/[username]",
      params: { username }
    });
  }

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-center text-lg">No users found matching &quot;{searchQuery}&quot;</Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1">
        {searchResults.map((user) => (
          <TouchableOpacity 
            key={user._id} 
            className="flex-row items-center p-4 border-b border-gray-100"
            onPress={() => navigateToProfile(user.username)}
          >
            <Image 
              source={{ uri: user.profilePicture || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }} 
              className="w-12 h-12 rounded-full"
            />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-gray-900">{user.firstName}</Text>
              <Text className="text-gray-500">@{user.username}</Text>
            </View>
            <FollowButton user={user}/>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      {/* HEADER */}
      <View className='px-4 py-4 border-b border-gray-100'>
        <View className='flex-row items-center bg-gray-100 rounded-full px-4'>
          <Feather name="search" size={20} color="#657786"/> 
            <TextInput
              placeholder='Search Twitter'
              className='flex-1 ml-3 text-base'
              placeholderTextColor="#657786"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
        </View>
      </View>
      <ScrollView className='flex-1'>
        {/* TRENDING TOPICS */}
        <View className='p-4'>
          <Text className='text-xl font-bold text-gray-900 mb-4'>Trending for you</Text>
          {TRENDING_TOPICS.map((item, index) => (
            <TouchableOpacity key={index} className="py-3 border-b border-gray-100">
              <Text className="text-gray-500 text-sm">Trending in IIIT-A</Text>
              <Text className="font-bold text-gray-900 text-lg">{item.topic}</Text>
              <Text className="text-gray-500 text-sm">{item.tweets} Tweets</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Search Results Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center p-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => setShowModal(false)} className="mr-4">
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-xl font-bold">Search Results</Text>
          </View>
          {renderSearchResults()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

export default SearchScreen