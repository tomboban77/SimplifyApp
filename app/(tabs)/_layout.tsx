import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pdfs"
        options={{
          title: 'PDFs',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-pdf-box" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resumes"
        options={{
          title: 'Resumes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

