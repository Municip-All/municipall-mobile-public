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
  const { classes, layoutStyles, typeStyles, colors } = useAppTheme();
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
          <Text className={`mb-2 ${classes.sectionTitle}`} style={typeStyles.sectionTitle}>{document.title}</Text>
        ) : null}
        <Text className={`mb-6 ${classes.meta}`} style={typeStyles.meta}>{document.subtitle}</Text>

        {document.sections.map((section) => (
          <View key={section.title} className='mb-6'>
            <Text
 className={`mb-2 text-base font-bold`} style={{ color: colors.textPrimary }}>
              {section.title}
            </Text>
            {section.paragraphs?.map((p, i) => (
              <Text key={`p-${i}`} className={`mb-3 ${classes.body}`} style={typeStyles.body}>
                {p}
              </Text>
            ))}
            {section.bullets?.map((b, i) => (
              <View key={`b-${i}`} className='mb-2 flex-row pl-1'>
                <Text className={`mr-2 ${classes.body}`} style={typeStyles.body}>•</Text>
                <Text className={`flex-1 ${classes.body}`} style={typeStyles.body}>{b}</Text>
              </View>
            ))}
          </View>
        ))}

        <View
          className='mt-2 rounded-2xl border p-4'
          style={{ borderColor: colors.border, backgroundColor: colors.card }}>
          <Text className={classes.meta} style={typeStyles.meta}>Document {LEGAL_ENTITY.documentVersion}</Text>
          <Text className={`mt-1 ${classes.body}`} style={typeStyles.body}>
            {LEGAL_ENTITY.publisherName} — {LEGAL_ENTITY.website}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
