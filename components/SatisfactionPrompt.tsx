import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@hooks/useAppTheme';
import { feedbackService, FeedbackResourceType, UserRating } from '../services/feedbackService';

type SatisfactionPromptProps = {
  resourceType: FeedbackResourceType;
  resourceId: number;
  initialRating?: UserRating;
  onSubmitted: (rating: UserRating) => void;
  title?: string;
};

export default function SatisfactionPrompt({
  resourceType,
  resourceId,
  initialRating,
  onSubmitted,
  title = "Comment s'est passé votre échange avec la mairie ?",
}: SatisfactionPromptProps) {
  const { dark, primaryColor, classes, colors } = useAppTheme();
  const [rating, setRating] = useState<UserRating | undefined>(initialRating);
  const [stars, setStars] = useState(initialRating?.stars ?? 0);
  const [message, setMessage] = useState(initialRating?.message ?? '');
  const [submitting, setSubmitting] = useState(false);

  if (rating) {
    return (
      <View className={`border-t px-4 py-5 ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <Text
          className={`mb-2 text-center text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
          Merci pour votre avis !
        </Text>
        <View className='flex-row items-center justify-center gap-1'>
          {[1, 2, 3, 4, 5].map((value) => (
            <Ionicons
              key={value}
              name={value <= rating.stars ? 'star' : 'star-outline'}
              size={22}
              color='#FF9500'
            />
          ))}
        </View>
        {rating.message ? (
          <Text className={`mt-3 text-center text-xs leading-5 ${classes.body}`}>
            « {rating.message} »
          </Text>
        ) : null}
      </View>
    );
  }

  const handleSubmit = async () => {
    if (stars < 1) {
      Alert.alert('Note requise', 'Veuillez sélectionner au moins une étoile.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await feedbackService.submit(resourceType, resourceId, stars, message);
      setRating(result);
      onSubmitted(result);
    } catch {
      Alert.alert('Erreur', "Impossible d'envoyer votre avis. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      className={`border-t px-4 py-5 ${dark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
      <Text className={`mb-1 text-center text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
        {title}
      </Text>
      <Text className={`mb-4 text-center text-xs ${classes.body}`}>
        Votre note aide la mairie à s&apos;améliorer. Le commentaire est optionnel.
      </Text>

      <View className='mb-4 flex-row items-center justify-center gap-2'>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => setStars(value)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`${value} étoile${value > 1 ? 's' : ''}`}>
            <Ionicons
              name={value <= stars ? 'star' : 'star-outline'}
              size={32}
              color={value <= stars ? '#FF9500' : colors.placeholder}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Ce qui s'est bien passé ou à améliorer… (optionnel)"
        placeholderTextColor={colors.placeholder}
        multiline
        maxLength={2000}
        className={`mb-4 min-h-[72px] rounded-2xl px-4 py-3 text-sm ${classes.formField} ${classes.formFieldText}`}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting || stars < 1}
        style={{
          backgroundColor: primaryColor,
          opacity: submitting || stars < 1 ? 0.5 : 1,
        }}
        className='items-center rounded-2xl py-3.5'>
        {submitting ? (
          <ActivityIndicator color='#FFF' />
        ) : (
          <Text className='text-sm font-bold text-white'>Envoyer mon avis</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
