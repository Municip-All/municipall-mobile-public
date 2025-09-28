import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Appearance,
  Image,
  ImageBackground,
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";


const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = theme === "system" ? Appearance.getColorScheme() : theme;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const logoSource =
    currentTheme === "dark"
      ? require("../assets/images/logo-blue.png")
      : require("../assets/images/logo-white.png");

  const backgroundImage =
    currentTheme === "dark"
      ? require("../assets/images/background-grey.png")
      : require("../assets/images/background-blue.png");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Veuillez entrer votre e-mail et votre mot de passe.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <ImageBackground
      source={backgroundImage}
      className="flex-1 justify-start items-center"
      resizeMode="cover"
    >
      <View className="flex-row items-center mt-20">
        <Image
          source={logoSource}
          className="w-4/12 h-24 mb-4"
          resizeMode="contain"
        />
        {currentTheme === "dark" ? (
          <MaskedView
            maskElement={
              <Text className="text-3xl font-inter-semibold">Cleany®</Text>
            }
          >
            <LinearGradient
              colors={["#06b6d4", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text className="opacity-0 text-3xl font-inter-semibold">
                Cleany®
              </Text>
            </LinearGradient>
          </MaskedView>
        ) : (
          <Text className="text-3xl font-inter-medium text-slate-100">
            Cleany®
          </Text>
        )}
      </View>

      <View className="mt-8 items-center">
        <Text className="text-7xl font-inter-semibold text-slate-100 mt-28">
          Bonjour
        </Text>
        <Text className="text-base font-inter-medium text-slate-100 mt-2">
          Connectez-vous à votre compte
        </Text>
      </View>

      <View className="w-10/12 mt-10">
        {[
          {
            value: email,
            setter: setEmail,
            placeholder: "Email",
            icon: "mail-outline",
            keyboardType: "email-address",
          },
          {
            value: password,
            setter: setPassword,
            placeholder: "Mot de passe",
            icon: "lock-closed-outline",
            secure: true,
          },
        ].map(
          (
            { value, setter, placeholder, icon, keyboardType, secure },
            index
          ) => (
            <View
              key={index as any}
              className="flex-row items-center w-10/12 mx-auto py-3 px-4 mb-4 rounded-full bg-slate-100"
            >
              <Ionicons
                name={icon as any}
                size={24}
                color={currentTheme === "dark" ? "#888" : "#000"}
                className="mr-2"
              />
              <TextInput
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                keyboardType={keyboardType as KeyboardTypeOptions}
                secureTextEntry={secure}
                autoCapitalize="none"
                placeholderTextColor={currentTheme === "dark" ? "#888" : "#aaa"}
                className="flex-1 text-black m-1"
              />
            </View>
          )
        )}

        <TouchableOpacity
          onPress={() => alert("Mot de passe oublié ?")}
          className="w-10/12 mx-auto"
        >
          <Text className="text-sm text-gray-500 text-right mb-6">
            Mot de passe oublié ?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          className="flex-row items-center justify-center py-3 rounded-full bg-blue-500 w-2/12 ml-auto mr-7"
        >
          <Text className="text-white text-lg font-inter-semibold">→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/signup")}
        className="absolute bottom-6 w-full items-center"
      >
        <Text className="font-inter-semibold text-white text-md">
          Pas encore de compte ? <Text className="text-blue-500">Créer</Text>
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default HomeScreen;
