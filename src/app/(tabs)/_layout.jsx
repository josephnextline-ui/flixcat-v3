import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, Search, Compass, Heart, Cat } from "lucide-react-native";

function TabIcon({ IconComponent, color, focused }) {
  return (
    <View
      style={{ alignItems: "center", justifyContent: "center", paddingTop: 2 }}
    >
      {focused && (
        <View
          style={{
            position: "absolute",
            top: -10,
            width: 28,
            height: 3,
            borderRadius: 2,
            backgroundColor: "#8b5cf6",
            shadowColor: "#8b5cf6",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 6,
          }}
        />
      )}
      <IconComponent size={22} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0d0d22",
          borderTopWidth: 1,
          borderTopColor: "#1e1e3f",
          paddingTop: 6,
          paddingBottom: 2,
        },
        tabBarActiveTintColor: "#8b5cf6",
        tabBarInactiveTintColor: "#4b4870",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Search} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Compass} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-list"
        options={{
          title: "Stash",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Heart} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Cat} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
