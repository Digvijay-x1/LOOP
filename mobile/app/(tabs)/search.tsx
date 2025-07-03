import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// todo: add this screen and made it actually working

const TRENDING_TOPICS = [
    { topic: "#ReactNative" , tweets: "125k" },
    { topic: "#ypeScript", tweets: "89k" },
    { topic: "#WebDevelopment", tweets: "234k"},
    { topic: "#Ai" , tweets: "567k"},
    { topic: "TechNews", tweets: "98k"},
];

const SearchScreen = () => {
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
            />
        </View>
      </View>
      <ScrollView  className='flex-1'>
        {/* TRENDING TOPICS */}
        <View className='p-4'>
          <Text className='text-xl font-bold text-gray-900 mb-4'>Trending for you</Text>
          {TRENDING_TOPICS.map((item, index) => (
            <TouchableOpacity key={index} className="py-3 border-b border-gray-100">
              <Text className="text-gray-500 text-sm">Trending in Technology</Text>
              <Text className="font-bold text-gray-900 text-lg">{item.topic}</Text>
              <Text className="text-gray-500 text-sm">{item.tweets} Tweets</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SearchScreen