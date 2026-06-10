import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BrandedLogo from '@components/BrandedLogo';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MaCommuneScreen() {
  const { dark, primaryColor, classes, layoutStyles, brand } = useAppTheme();
  const { config } = useCity();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const profile = config?.publicProfile;
  const cityName = config?.officialName || config?.name || brand.appName;
  const appName = config?.name || brand.appName;
  const mayorTitle = profile?.mayorTitle?.trim() || 'Maire';
  const mayorName = profile?.mayorName?.trim();

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => router.back()}
          className='mb-4 flex-row items-center gap-1 self-start'
          hitSlop={12}>
          <Ionicons name='chevron-back' size={22} color={primaryColor} />
          <Text style={{ color: primaryColor }} className='text-sm font-semibold'>
            Retour
          </Text>
        </TouchableOpacity>

        <View className={`mb-6 items-center rounded-[32px] p-8 ${classes.card}`}>
          <BrandedLogo size={88} radius={44} mode='contain' />
          <Text
            className={`mt-4 text-center text-2xl font-black ${dark ? 'text-white' : 'text-black'}`}>
            {cityName}
          </Text>
          {appName !== cityName && (
            <Text
              className={`mt-1 text-center text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Application {appName}
            </Text>
          )}
          {profile?.welcomeText ? (
            <Text className={`mt-4 text-center text-sm leading-6 ${classes.body}`}>
              {profile.welcomeText}
            </Text>
          ) : (
            <Text className={`mt-4 text-center text-sm leading-6 ${classes.body}`}>
              Bienvenue sur l&apos;application municipale de {cityName}. Retrouvez ici les services,
              l&apos;actualité et les démarches de votre commune.
            </Text>
          )}
        </View>

        {mayorName ? (
          <View className={`mb-4 rounded-[24px] p-5 ${classes.card}`}>
            <Text className={`text-[10px] font-bold tracking-widest text-zinc-400 uppercase`}>
              Élu référent
            </Text>
            <Text className={`mt-2 text-lg font-bold ${dark ? 'text-white' : 'text-black'}`}>
              {mayorName}
            </Text>
            <Text className={`mt-0.5 text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {mayorTitle}
            </Text>
          </View>
        ) : null}

        {profile?.description ? (
          <View className={`mb-4 rounded-[24px] p-5 ${classes.card}`}>
            <Text className={`mb-2 text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
              À propos
            </Text>
            <Text className={`text-sm leading-6 ${classes.body}`}>{profile.description}</Text>
          </View>
        ) : null}

        <View className={`mb-4 rounded-[24px] p-5 ${classes.card}`}>
          <Text className={`mb-3 text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
            Informations pratiques
          </Text>
          {profile?.address ? (
            <View className='mb-3 flex-row gap-3'>
              <Ionicons name='location-outline' size={18} color={primaryColor} />
              <Text className={`flex-1 text-sm leading-5 ${classes.body}`}>{profile.address}</Text>
            </View>
          ) : null}
          {profile?.openingHours ? (
            <View className='mb-3 flex-row gap-3'>
              <Ionicons name='time-outline' size={18} color={primaryColor} />
              <Text className={`flex-1 text-sm leading-5 ${classes.body}`}>
                {profile.openingHours}
              </Text>
            </View>
          ) : null}
          {config?.contact?.phone ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${config.contact!.phone!.replace(/\s/g, '')}`)}
              className='mb-3 flex-row gap-3'>
              <Ionicons name='call-outline' size={18} color={primaryColor} />
              <Text style={{ color: primaryColor }} className='flex-1 text-sm font-semibold'>
                {config.contact.phone}
              </Text>
            </TouchableOpacity>
          ) : null}
          {config?.contact?.email ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${config.contact!.email}`)}
              className='mb-3 flex-row gap-3'>
              <Ionicons name='mail-outline' size={18} color={primaryColor} />
              <Text style={{ color: primaryColor }} className='flex-1 text-sm font-semibold'>
                {config.contact.email}
              </Text>
            </TouchableOpacity>
          ) : null}
          {profile?.website ? (
            <TouchableOpacity
              onPress={() => {
                const url = profile.website!.startsWith('http')
                  ? profile.website!
                  : `https://${profile.website}`;
                Linking.openURL(url);
              }}
              className='flex-row gap-3'>
              <Ionicons name='globe-outline' size={18} color={primaryColor} />
              <Text style={{ color: primaryColor }} className='flex-1 text-sm font-semibold'>
                Site de la mairie
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View className='flex-row flex-wrap gap-2'>
          <TouchableOpacity
            onPress={() => router.push('/contact')}
            className='flex-1 items-center rounded-2xl py-4'
            style={{ backgroundColor: primaryColor, minWidth: '45%' }}>
            <Text className='text-sm font-bold text-white'>Contacter la mairie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/social')}
            className={`flex-1 items-center rounded-2xl border py-4 ${
              dark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'
            }`}
            style={{ minWidth: '45%' }}>
            <Text className={`text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
              Vie associative
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
