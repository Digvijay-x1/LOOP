import {Text  } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import SignOutButton from '@/components/SignOutButton'
import { useUserSync } from '@/hooks/useUserSync'

const HomeScreen = () => {
  useUserSync();
  return (
    <SafeAreaView className='flex-1'>
      <Text>HomeScreen welcome to loop</Text>
      <SignOutButton/>
    </SafeAreaView>
  )
}

export default HomeScreen