import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';

const CGUPage: React.FC = () => {
  const { dark, classes } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View className={`flex-1 ${classes.page}`}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <Text className={`mb-6 text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
          Conditions Générales d&apos;Utilisation
        </Text>

        <Text className={classes.body}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae eros eget tellus
          tristique bibendum. Donec rutrum sed sem quis venenatis.
        </Text>

        <Text className={`mt-4 ${classes.body}`}>
          Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
          egestas. Integer nec libero venenatis, ultricies ligula id, sollicitudin lacus.
        </Text>
      </ScrollView>
    </View>
  );
};

export default CGUPage;
