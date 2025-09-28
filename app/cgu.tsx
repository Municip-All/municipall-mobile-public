import React from "react";
import { ScrollView, Text } from "react-native";

const CGUPage: React.FC = () => {
  return (
    <ScrollView className="flex-1 p-4 bg-gray-900">
      <Text className="text-white text-2xl font-bold mb-4">
        Conditions Générales d&apos;Utilisation
      </Text>

      {/* Add the actual CGU content here */}
      <Text className="text-white text-base mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae
        eros eget tellus tristique bibendum. Donec rutrum sed sem quis
        venenatis.
      </Text>

      {/* More CGU content */}
      <Text className="text-white text-base mb-4">
        Pellentesque habitant morbi tristique senectus et netus et malesuada
        fames ac turpis egestas. Integer nec libero venenatis, ultricies ligula
        id, sollicitudin lacus.
      </Text>

      {/* Add as much content as you need */}
    </ScrollView>
  );
};

export default CGUPage;
