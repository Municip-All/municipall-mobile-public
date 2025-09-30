import { Ionicons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Appearance,
  Image,
  ImageBackground,
  KeyboardTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SignupScreen: React.FC = () => {
  const { theme } = useTheme();
  const currentTheme = theme === 'system' ? Appearance.getColorScheme() : theme;
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const logoSource =
    currentTheme === "dark"
      ? require("../assets/images/logo-blue.png")
      : require("../assets/images/logo-white.png");
  const backgroundImage =
    currentTheme === "dark"
      ? require("../assets/images/background-grey.png")
      : require("../assets/images/background-blue.png");

  const handleRegister = () => {
    if (!email || !password || !username || !phone) {
      alert("Veuillez entrer toutes les informations.");
      return;
    }
    alert(`Connexion réussie avec l'email : ${email}`);
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
        <Text className="text-4xl font-inter-semibold text-slate-100 mt-28">
          Créez votre compte
        </Text>
        <Text className="text-base font-inter-medium text-slate-100 mt-2">
          On a hâte de vous connaitre !
        </Text>
      </View>

      <View className="w-10/12 mt-10">
        {[
          {
            placeholder: "Identifiant",
            value: username,
            setter: setUsername,
            icon: "person-outline",
          },
          {
            placeholder: "Email",
            value: email,
            setter: setEmail,
            icon: "mail-outline",
            keyboardType: "email-address",
          },
          {
            placeholder: "Mot de passe",
            value: password,
            setter: setPassword,
            icon: "lock-closed-outline",
            secure: true,
          },
          {
            placeholder: "Téléphone",
            value: phone,
            setter: setPhone,
            icon: "call-outline",
            keyboardType: "phone-pad",
          },
        ].map(
          (
            { placeholder, value, setter, icon, keyboardType, secure },
            index
          ) => (
            <View
              key={index}
              className="flex-row items-center w-10/12 mx-auto py-3 px-4 mb-4 rounded-full bg-slate-100"
            >
              <Ionicons
                // @ToDo
                name={icon as any}
                size={24}
                color={currentTheme === "dark" ? "#028CF3" : "#000"}
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
          onPress={handleRegister}
          className="flex-row items-center justify-center py-3 rounded-full bg-blue-500 w-2/12 ml-auto mr-7 mt-6"
        >
          <Text className="text-white text-lg font-inter-semibold">→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        className="absolute bottom-6 w-full items-center"
      >
        <Text className="font-inter-semibold text-white text-md">
          Vous avez déjà un compte ?{" "}
          <Text className="text-blue-500">Connectez-vous !</Text>
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

export default SignupScreen;
