import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[username]" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
} 