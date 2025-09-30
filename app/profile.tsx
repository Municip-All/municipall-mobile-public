import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ThemeSelector from '../components/ThemeSelector';
import { useTheme } from '../context/ThemeContext';

const ProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <ScrollView
      className={`flex-1 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}
    >
      <View className="relative">
        <ImageBackground
          source={require('../assets/images/background-blue.png')}
          style={{ height: 160, overflow: "hidden" }}
        />
        <View className="absolute items-center top-16 left-0 right-0">
          <LinearGradient
            colors={['#06b6d4', '#3b82f6']}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require('../assets/images/avatar.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: "white",
              }}
            />
          </LinearGradient>
          <Text
            className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-lg font-bold mt-4`}
          >
            John Brown
          </Text>
          <Text className="text-gray-400 text-sm">He/him</Text>
          <View className="absolute top-[89%] right-[38%]">
            <Ionicons name="checkmark-circle" size={18} color="#3b82f6" />
          </View>
        </View>
      </View>

      <View className="p-4 mt-4 rounded-lg">
        <Text
          className={`text-xl font-bold mb-2 mt-16 ml-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
        >
          Tous vos signalements
        </Text>
        <View
          className={`rounded-lg mx-4 ${theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-600'}`}
        >
          <TouchableOpacity className="flex-row justify-between items-center p-2 border-b border-gray-300 dark:border-slate-800">
            <View className="flex-row items-center">
              <View className="bg-blue-400 rounded-full p-2">
                <Ionicons name="pricetag-outline" size={16} color="#fff" />
              </View>
              <View>
                <Text className='text-base font-bold ml-2 text-white'>
                  Tag &quot;SKIBIDI&quot;
                </Text>
                <Text className="text-xs text-gray-400 ml-2">
                  68 rue Gignac
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center p-2 border-b border-gray-300 dark:border-slate-800">
            <View className="flex-row items-center">
              <View className="bg-green-500 rounded-full p-2">
                <Ionicons name="trash-outline" size={16} color="#fff" />
              </View>
              <View>
                <Text className='text-base font-bold ml-2 text-white'>
                  Déchets
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  47 rue de Villier
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center p-2">
            <View className="flex-row items-center">
              <View className="bg-red-400 rounded-full p-2">
                <Ionicons name="images-outline" size={16} color="#fff" />
              </View>
              <View>
                <Text className='text-base font-bold ml-2 text-white'>
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
        <Text className="text-sm text-gray-500 italic ml-4 mt-2">
          Voir plus...
        </Text>
      </View>

      <View className="p-4">
        <Text
          className={`font-semibold text-lg mb-4 mx-auto ${theme === 'dark' ? 'text-white' : 'text-black'}`}
        >
          Paramètres et confidentialité
        </Text>
        <View className="flex-row items-center bg-gray-200 dark:bg-zinc-700 rounded-full px-3 py-2 -mb-4">
          <Ionicons name="search" size={24} color="#888" className="mr-2" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher..."
            placeholderTextColor="#888"
            className="flex-1 text-base text-black dark:text-white px-2"
          />
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-[1px] bg-gray-500 mr-4" />
          <Text
            className={`text-base font-semibold mr-32 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          >
            Votre compte
          </Text>
        </View>
        <LinearGradient
          colors={['#ffffff', '']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-full p-[2px] mx-4"
        >
          <TouchableOpacity className="flex-row justify-between items-center bg-gray-800 p-3 rounded-full mb-4">
            <View className="flex-row items-center">
              <Image
                source={require('../assets/images/avatar.png')}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View>
                <Text className="text-white text-sm font-bold">Mon compte</Text>
                <Text className="text-gray-400 text-xs">
                  Mot de passe, email, informations
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        <View className="flex-row items-center my-4">
          <Text className={`text-base ml-32 mr-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Votre application
          </Text>
          <View className="flex-1 h-[1px] bg-gray-500" />
        </View>

        <ThemeSelector />

        <View className="mb-4">
          <TouchableOpacity
            className="flex-row justify-between items-center mt-4 rounded-lg"
            onPress={() => router.push("/cgu")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="document-text-outline"
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
                className="mr-4"
              />
              <Text
                className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-base ml-1`}
              >
                Conditions générales d&apos;utilisation
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between mt-4 items-center rounded-lg">
            <View className="flex-row items-center">
              <Ionicons
                name="language-outline"
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
                className="mr-4"
              />
              <Text
                className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-base ml-1`}
              >
                Langue
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <View className="border-b border-gray-500 flex-1 mr-2" />
            <Text
              className={`font-semibold text-sm mr-36 ${theme === "dark" ? "text-white" : "text-black"
                }`}
            >
              Assistance
            </Text>
          </View>

          <TouchableOpacity className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={theme === 'dark' ? 'white' : 'black'}
                className="mr-4"
              />
              <Text
                className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-base ml-1`}
              >
                Aide
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-between items-center mt-4">
            <View className="flex-row items-center">
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={theme === "dark" ? "white" : "black"}
                className="mr-4"
              />
              <Text
                className={`${theme === "dark" ? "text-white" : "text-black"
                  } text-base ml-1`}
              >
                À propos
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row justify-between items-center mt-12"
            onPress={() => router.push('/')}
          >
            <View className="flex-row items-center">
              <Text className="text-white text-base ml-1 text-red-600">
                Se déconnecter
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
