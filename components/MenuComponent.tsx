import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const MenuComponent: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  return (
    <ScrollView className="p-5">
      <View className="flex-row items-center bg-zinc-600 rounded-lg px-3 py-2 mb-6">
        <Ionicons name="search" size={24} color="gray" className="mr-2" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="On est là pour vous aider !"
          placeholderTextColor={theme === "dark" ? "#888" : "#aaa"}
          className="flex-1 text-base text-black dark:text-white px-2"
        />
        <Ionicons name="mic-outline" size={24} color="gray" className="ml-2" />
      </View>

      <Text
        className={`${theme === "dark" ? "text-white" : "text-black"
          } text-lg font-bold mb-2`}
      >
        Favoris
      </Text>

      <View className="flex-row justify-between mb-6 bg-zinc-600 p-2 rounded-lg">
        <TouchableOpacity
          className="flex-1 items-center bg-gray-100 rounded-lg py-1 px-3 mx-1"
          onPress={() => router.push("/report")}
        >
          <Ionicons name="warning-outline" size={16} color="#028CF3" />
          <Text className="ml-2 text-xs text-black">Signalement</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center bg-gray-100 rounded-lg py-1 px-3 mx-1">
          <Ionicons name="locate-outline" size={16} color="#028CF3" />
          <Text className="ml-2 text-xs text-black">Localisez-moi !</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 items-center bg-gray-100 rounded-lg py-1 px-3 mx-1">
          <Ionicons name="leaf-outline" size={16} color="#028CF3" />
          <Text className="ml-2 text-xs text-black">Compostes</Text>
        </TouchableOpacity>
      </View>

      <Text
        className={`${theme === "dark" ? "text-white" : "text-black"
          } text-lg font-bold mb-4`}
      >
        Vos récents rapports
      </Text>

      <View className="bg-zinc-600 rounded-lg">
        <TouchableOpacity className="flex-row justify-between items-center p-3 border-b border-gray-300 dark:border-slate-800">
          <View className="flex-row items-center">
            <View className="bg-blue-400 rounded-full p-2">
              <Ionicons name="pricetag-outline" size={16} color="#fff" />
            </View>
            <View>
              <Text className="text-base font-bold text-black dark:text-white ml-2">
                Tag "SKIBIDI"
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                68 rue Gignac
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row justify-between items-center p-3 border-b border-gray-300 dark:border-slate-800">
          <View className="flex-row items-center">
            <View className="bg-green-500 rounded-full p-2">
              <Ionicons name="trash-outline" size={16} color="#fff" />
            </View>
            <View>
              <Text className="text-base font-bold text-black dark:text-white ml-2">
                Déchets
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                47 rue de Villier
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row justify-between items-center p-4">
          <View className="flex-row items-center">
            <View className="bg-red-400 rounded-full p-2">
              <Ionicons name="images-outline" size={16} color="#fff" />
            </View>
            <View>
              <Text className="text-base font-bold text-black dark:text-white ml-2">
                Autocollants
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                12 chemin de Papaille
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text
        className={`${theme === "dark" ? "text-white" : "text-black"
          } text-lg font-bold mt-6 mb-2`}
      >
        Vos points
      </Text>
      <TouchableOpacity className="flex-row justify-between items-center bg-zinc-700 rounded-lg p-4">
        <View className="flex-row items-center">
          <View className="bg-yellow-500 rounded-full p-2">
            <Ionicons name="star-outline" size={20} color="#fff" />
          </View>
          <View>
            <Text className="text-base font-bold text-black dark:text-white ml-2">
              + 5
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2 italic">
              Encore un petit effort !
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Text
        className={`${theme === "dark" ? "text-white" : "text-black"
          } text-center font-bold mt-4`}
      >
        Cleany®
      </Text>
    </ScrollView>
  );
};

export default MenuComponent;
