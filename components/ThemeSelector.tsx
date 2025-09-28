import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
// 1. Importer ThemeContext en plus de useTheme
import { useTheme, ThemeContext } from "../context/ThemeContext";

const ThemeSelector: React.FC = () => {
  // 2. Récupérer l'objet de contexte complet
  const contextValue = useTheme();
  const { theme, setTheme, colorScheme } = contextValue;
  const [modalVisible, setModalVisible] = useState(false);

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        className="flex-row justify-between items-center"
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="moon-outline"
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
          />
          <Text className="text-base text-black dark:text-white ml-4">
            Thème
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={colorScheme === "dark" ? "#fff" : "#000"}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        {/* 3. Envelopper le contenu du Modal avec le Provider */}
        <ThemeContext.Provider value={contextValue}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className="flex-1 justify-center items-center bg-black/50">
              <TouchableWithoutFeedback onPress={() => { }}>
                <View className="w-11/12 rounded-lg p-6 bg-white dark:bg-gray-900">
                  <Text className="text-lg font-bold mb-4 text-black dark:text-white">
                    Choisissez un thème
                  </Text>

                  <TouchableOpacity
                    className="flex-row items-center justify-between p-4 rounded-lg mb-2 bg-gray-100 dark:bg-gray-800"
                    onPress={() => handleThemeChange("system")}
                  >
                    <Text className="text-base text-black dark:text-white">
                      Système
                    </Text>
                    {theme === "system" && (
                      <Ionicons name="checkmark" size={24} color={colorScheme === "dark" ? "white" : "black"} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center justify-between p-4 rounded-lg mb-2 bg-gray-100 dark:bg-gray-800"
                    onPress={() => handleThemeChange("light")}
                  >
                    <Text className="text-base text-black dark:text-white">Clair</Text>
                    {theme === "light" && (
                      <Ionicons name="checkmark" size={24} color={colorScheme === "dark" ? "white" : "black"} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-row items-center justify-between p-4 rounded-lg mb-2 bg-gray-100 dark:bg-gray-800"
                    onPress={() => handleThemeChange("dark")}
                  >
                    <Text className="text-base text-black dark:text-white">Sombre</Text>
                    {theme === "dark" && (
                      <Ionicons name="checkmark" size={24} color={colorScheme === "dark" ? "white" : "black"} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-blue-500 p-3 rounded-lg mt-4"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-white text-center font-medium">Fermer</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </ThemeContext.Provider>
      </Modal>
    </View>
  );
};

export default ThemeSelector;