import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. Importer ThemeContext en plus de useTheme
import { useTheme, ThemeContext } from '../context/ThemeContext';

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
        className='flex-row items-center justify-between'
        onPress={() => setModalVisible(true)}>
        <View className='flex-row items-center'>
          <Ionicons
            name='moon-outline'
            size={24}
            color={colorScheme === 'dark' ? 'white' : 'black'}
          />
          <Text className='ml-4 text-base text-black dark:text-white'>Thème</Text>
        </View>
        <Ionicons
          name='chevron-forward'
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}>
        {/* 3. Envelopper le contenu du Modal avec le Provider */}
        <ThemeContext.Provider value={contextValue}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className='flex-1 items-center justify-center bg-black/50'>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View className='w-11/12 rounded-lg bg-white p-6 dark:bg-gray-900'>
                  <Text className='mb-4 text-lg font-bold text-black dark:text-white'>
                    Choisissez un thème
                  </Text>

                  <TouchableOpacity
                    className='mb-2 flex-row items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800'
                    onPress={() => handleThemeChange('system')}>
                    <Text className='text-base text-black dark:text-white'>Système</Text>
                    {theme === 'system' && (
                      <Ionicons
                        name='checkmark'
                        size={24}
                        color={colorScheme === 'dark' ? 'white' : 'black'}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className='mb-2 flex-row items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800'
                    onPress={() => handleThemeChange('light')}>
                    <Text className='text-base text-black dark:text-white'>Clair</Text>
                    {theme === 'light' && (
                      <Ionicons
                        name='checkmark'
                        size={24}
                        color={colorScheme === 'dark' ? 'white' : 'black'}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className='mb-2 flex-row items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800'
                    onPress={() => handleThemeChange('dark')}>
                    <Text className='text-base text-black dark:text-white'>Sombre</Text>
                    {theme === 'dark' && (
                      <Ionicons
                        name='checkmark'
                        size={24}
                        color={colorScheme === 'dark' ? 'white' : 'black'}
                      />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className='mt-4 rounded-lg bg-blue-500 p-3'
                    onPress={() => setModalVisible(false)}>
                    <Text className='text-center font-medium text-white'>Fermer</Text>
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
