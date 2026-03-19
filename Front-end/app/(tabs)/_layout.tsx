import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
      
      {/* Tab Sản phẩm */}
      <Tabs.Screen
        name="product"
        options={{
          title: 'Sản phẩm',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* Tab Khách hàng */}
      <Tabs.Screen
        name="customer"
        options={{
          title: 'Khách hàng',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* Tab Hóa đơn */}
      <Tabs.Screen
        name="invoice"
        options={{
          title: 'Hóa đơn',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}