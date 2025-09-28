import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useTheme } from "../context/ThemeContext";

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();

  const isDarkTheme = theme === "dark";
  const logoSource = isDarkTheme
    ? require("../assets/images/logo-blue.png")
    : require("../assets/images/logo-white.png");
  const backgroundImage = isDarkTheme
    ? require("../assets/images/background-grey.png")
    : require("../assets/images/background-blue.png");

  return (
    <ImageBackground
      source={backgroundImage}
      className="flex-1 justify-center items-center"
      resizeMode="cover"
    >
      <Image
        source={logoSource}
        className="h-1/4 w-4/12 mb-4"
        resizeMode="contain"
      />

      {isDarkTheme ? (
        <MaskedView
          maskElement={
            <Text
              style={{
                fontSize: 40,
                fontFamily:
                  Platform.OS === "ios"
                    ? "Inter-SemiBold"
                    : "Inter_600SemiBold",
                backgroundColor: "transparent",
              }}
            >
              Cleany®
            </Text>
          }
        >
          <LinearGradient
            colors={["#06b6d4", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={{
                opacity: 0,
                fontSize: 40,
                fontFamily:
                  Platform.OS === "ios"
                    ? "Inter-SemiBold"
                    : "Inter_600SemiBold",
              }}
            >
              Cleany®
            </Text>
          </LinearGradient>
        </MaskedView>
      ) : (
        <Text className="text-4xl font-inter-medium text-slate-100">
          Cleany®
        </Text>
      )}

      <View className="w-full px-8 mt-8">
        <Text className="text-slate-100 text-center text-lg font-inter-semibold mb-2">
          De retour ? Connectez-vous !
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          className={`rounded-full w-10/12 mx-auto overflow-hidden mb-6 ${isDarkTheme ? "bg-transparent" : "bg-slate-100"
            }`}
          activeOpacity={0.8}
        >
          {isDarkTheme ? (
            <LinearGradient
              colors={["#06b6d4", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-3 w-full justify-center items-center"
            >
              <Text className="text-slate-100 text-center text-lg font-inter-semibold">
                Connexion
              </Text>
            </LinearGradient>
          ) : (
            <Text className="text-sky-400 text-center text-lg font-inter-medium py-3">
              Connexion
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-slate-100 text-center text-lg font-inter-semibold mb-2">
          Vous êtes nouveau ? Inscrivez-vous !
        </Text>

        <TouchableOpacity
          className="py-3 rounded-full bg-slate-100 w-10/12 mx-auto overflow-hidden mb-6"
          onPress={() => router.push("/signup")}
        >
          <Text className="text-sky-400 text-center text-lg font-inter-medium">
            Inscription
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;
