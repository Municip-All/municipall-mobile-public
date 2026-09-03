import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import LegalFooterLinks from '@components/LegalFooterLinks';
import { useAppTheme } from '@hooks/useAppTheme';

const ONBOARDING_KEY = 'onboarding_completed_v1';

const steps = [
  {
    icon: 'leaf-outline' as const,
    title: "Bienvenue sur Municip'All",
    desc: 'Découvrez les composteurs, sanisettes et suivez vos signalements facilement.',
  },
  {
    icon: 'map-outline' as const,
    title: 'Carte et signalements',
    desc: 'Localisez les points utiles et signalez un problème en quelques secondes.',
  },
  {
    icon: 'chatbubble-ellipses-outline' as const,
    title: 'Contact & suivi',
    desc: 'Envoyez des suggestions à la mairie et suivez leur traitement.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { dark, primaryColor, classes, colors, tintColor, layoutStyles, typeStyles } = useAppTheme();
  const [index, setIndex] = useState(0);
  const [completing, setCompleting] = useState(false);
  const total = steps.length;
  const stepColors = [colors.success, colors.info, colors.primary];

  const nextLabel = useMemo(
    () => (index < total - 1 ? 'Suivant' : "C'est parti !"),
    [index, total]
  );

  const complete = async () => {
    setCompleting(true);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      Alert.alert('Erreur', "Impossible d'enregistrer votre progression. Réessayez.");
      setCompleting(false);
      return;
    }
    router.replace('/home');
  };

  const onNext = async () => {
    if (index < total - 1) setIndex((i) => i + 1);
    else await complete();
  };

  const onSkip = async () => {
    await complete();
  };

  return (
    <View style={layoutStyles.page} className='items-center justify-between px-6 pt-20 pb-14'>
      <View className='items-center'>
        <View
          className='mb-5 h-16 w-16 items-center justify-center rounded-full'
          style={{ backgroundColor: tintColor(stepColors[index], '20') }}>
          <Ionicons name={steps[index].icon} size={28} color={stepColors[index]} />
        </View>
        <Text className={`text-center ${classes.sectionTitle}`} style={typeStyles.sectionTitle}>{steps[index].title}</Text>
        <Text className={`mt-3 text-center text-sm leading-6 ${classes.body}`} style={typeStyles.body}>
          {steps[index].desc}
        </Text>
      </View>

      <View className='w-full items-center'>
        <View className='mb-6 flex-row items-center'>
          {steps.map((_, i) => (
            <View
              key={i}
              className={`mx-1 h-2 w-8 rounded-full ${dark ? 'bg-night-border' : 'bg-cream-200'}`}
              style={i === index ? { backgroundColor: primaryColor, width: 32 } : {}}
            />
          ))}
        </View>
        <View className='w-full flex-row items-center justify-between'>
          <TouchableOpacity onPress={onSkip} accessibilityRole='button' accessibilityLabel='Passer'>
            <Text className={`text-sm`} style={{ color: colors.textSecondary }}>Passer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onNext}
            disabled={completing}
            className='rounded-xl px-8 py-3'
            style={{ backgroundColor: primaryColor }}
            accessibilityRole='button'
            accessibilityLabel={nextLabel}>
            {completing ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text className='font-semibold' style={{ color: colors.onPrimary }}>
                {nextLabel}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {index === total - 1 ? (
          <View className='mt-6 w-full'>
            <LegalFooterLinks />
          </View>
        ) : null}
      </View>
    </View>
  );
}
