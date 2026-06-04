import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';

export default function LegalFooterLinks() {
  const router = useRouter();
  const { dark, primaryColor } = useAppTheme();

  const Item = ({ label, href }: { label: string; href: string }) => (
    <TouchableOpacity onPress={() => router.push(href as any)} className='px-2 py-1'>
      <Text className='text-[11px] font-semibold' style={{ color: primaryColor }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className='items-center px-4 pb-2'>
      <View className='flex-row flex-wrap items-center justify-center'>
        <Item label='CGU' href='/legal/cgu' />
        <Text className={`text-[11px] ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>·</Text>
        <Item label='Confidentialité' href='/legal/privacy' />
        <Text className={`text-[11px] ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>·</Text>
        <Item label='Mentions légales' href='/legal/mentions-legales' />
      </View>
      <TouchableOpacity onPress={() => router.push('/legal')} className='mt-1 py-1'>
        <Text className={`text-[10px] ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
          Informations légales complètes
        </Text>
      </TouchableOpacity>
    </View>
  );
}
