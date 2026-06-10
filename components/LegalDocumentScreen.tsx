import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import ProfileScreenHeader from '@components/ProfileScreenHeader';
import type { LegalDocument } from '../constants/legalContent';
import { LEGAL_ENTITY } from '../constants/legalEntity';

type Props = {
  document: LegalDocument;
  showBackHeader?: boolean;
};

export default function LegalDocumentScreen({ document, showBackHeader = true }: Props) {
  const { dark, classes, layoutStyles } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={layoutStyles.page}>
      {showBackHeader ? <ProfileScreenHeader title={document.title} /> : null}
      <ScrollView
        contentContainerStyle={{
          paddingTop: showBackHeader ? 8 : insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        {!showBackHeader ? (
          <Text className={`mb-2 text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
            {document.title}
          </Text>
        ) : null}
        <Text className={`mb-6 ${classes.meta}`}>{document.subtitle}</Text>

        {document.sections.map((section) => (
          <View key={section.title} className='mb-6'>
            <Text className={`mb-2 text-base font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>
              {section.title}
            </Text>
            {section.paragraphs?.map((p, i) => (
              <Text key={`p-${i}`} className={`mb-3 ${classes.body}`}>
                {p}
              </Text>
            ))}
            {section.bullets?.map((b, i) => (
              <View key={`b-${i}`} className='mb-2 flex-row pl-1'>
                <Text className={`mr-2 ${classes.body}`}>•</Text>
                <Text className={`flex-1 ${classes.body}`}>{b}</Text>
              </View>
            ))}
          </View>
        ))}

        <View
          className={`mt-2 rounded-2xl border p-4 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
          <Text className={classes.meta}>Document {LEGAL_ENTITY.documentVersion}</Text>
          <Text className={`mt-1 ${classes.body}`}>
            {LEGAL_ENTITY.publisherName} — {LEGAL_ENTITY.website}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
