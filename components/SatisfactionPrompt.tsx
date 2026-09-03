import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@hooks/useAppTheme';
import { feedbackService, FeedbackResourceType } from '../services/feedbackService';
import type { UserRating } from '../lib/types';

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
  const { primaryColor, classes, colors, typeStyles } = useAppTheme();
  const [rating, setRating] = useState<UserRating | undefined>(initialRating);
  const [stars, setStars] = useState(initialRating?.stars ?? 0);
  const [message, setMessage] = useState(initialRating?.message ?? '');
  const [submitting, setSubmitting] = useState(false);

  if (rating) {
    return (
      <View className='border-t px-4 py-5' style={{ borderColor: colors.border }}>
        <Text className='mb-2 text-center text-sm font-bold' style={{ color: colors.textPrimary }}>
          Merci pour votre avis !
        </Text>
        <View className='flex-row items-center justify-center gap-1'>
          {[1, 2, 3, 4, 5].map((value) => (
            <Ionicons
              key={value}
              name={value <= rating.stars ? 'star' : 'star-outline'}
              size={22}
              color={colors.warning}
            />
          ))}
        </View>
        {rating.message ? (
          <Text className={`mt-3 text-center text-xs leading-5 ${classes.body}`} style={typeStyles.body}>
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
      className='border-t px-4 py-5'
      style={{ borderColor: colors.border, backgroundColor: colors.card }}>
      <Text className='mb-1 text-center text-sm font-bold' style={{ color: colors.textPrimary }}>
        {title}
      </Text>
      <Text className={`mb-4 text-center text-xs ${classes.body}`} style={typeStyles.body}>
        Votre note aide la mairie à s&apos;améliorer. Le commentaire est optionnel.
      </Text>

      <View className='mb-4 flex-row items-center justify-center gap-2'>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => setStars(value)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={`${value} étoile${value > 1 ? 's' : ''}`}
            accessibilityRole='button'>
            <Ionicons
              name={value <= stars ? 'star' : 'star-outline'}
              size={32}
              color={value <= stars ? colors.warning : colors.placeholder}
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
        className={`mb-4 min-h-[72px] rounded-xl px-4 py-3 text-sm ${classes.formField} ${classes.formFieldText}`}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting || stars < 1}
        accessibilityLabel='Envoyer mon avis'
        accessibilityRole='button'
        style={{
          backgroundColor: primaryColor,
          opacity: submitting || stars < 1 ? 0.5 : 1,
        }}
        className='items-center rounded-xl py-3.5'>
        {submitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text className='text-sm font-bold' style={{ color: colors.onPrimary }}>
            Envoyer mon avis
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
