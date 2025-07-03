import { Tabs , Redirect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/clerk-expo'

const TabsLayout = () => {
    const insets = useSafeAreaInsets();
    const { isSignedIn } = useAuth();
    
  if(!isSignedIn) {
    return <Redirect href={"/(auth)"} />
  }
  return (
    <Tabs
    screenOptions={{
        tabBarActiveTintColor: "#1DA1F2",
        tabBarInactiveTintColor: "#667085",
        tabBarStyle: {
            backgroundColor: "#000000",
            borderTopColor: "#2F2F2F",
            borderTopWidth: 1,
            paddingTop: 13,
            height: 60 + insets.bottom,
        },
        headerShown: false, 
    }}
    >
        <Tabs.Screen name="index" options={{
            title: "",
            tabBarIcon: ({ color , size}) => <Feather name="home" color={color} size={size} />
        }}
        />
        <Tabs.Screen name="search" options={{
            title: "",
            tabBarIcon: ({ color , size}) => <Feather name="search" color={color} size={size} />
        }}
        />
        <Tabs.Screen name="notifications" options={{
            title: "",
            tabBarIcon: ({ color , size}) => <Feather name="bell" color={color} size={size} />
        }}
        />
        <Tabs.Screen name="messages" options={{
            title: "",
            tabBarIcon: ({ color , size}) => <Feather name="message-circle" color={color} size={size} />
        }}
        />
        <Tabs.Screen name="profile" options={{
            title: "",
            tabBarIcon: ({ color , size}) => <Feather name="user" color={color} size={size} />
        }}
        />
        
    </Tabs>
  )
}

export default TabsLayout