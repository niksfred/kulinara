import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        headerShown: false,
        sceneStyle: {
          paddingTop: insets.top + 16,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Groceries',
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
        }}
      />
      <Tabs.Screen
        name="add-edit"
        options={{
          title: 'Add/Edit',
          href: null,
        }}
      />
    </Tabs>
  );
}
