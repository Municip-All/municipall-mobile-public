import { useMemo } from 'react';
import {
  buildCguDocument,
  buildCookiesDocument,
  buildMentionsDocument,
  buildPrivacyDocument,
  type LegalDocument,
} from '../constants/legalContent';
import { useCityLegalContext } from './useCityLegalContext';

export function useLegalDocuments(): {
  cgu: LegalDocument;
  privacy: LegalDocument;
  mentions: LegalDocument;
  cookies: LegalDocument;
  cityContext: ReturnType<typeof useCityLegalContext>;
} {
  const cityContext = useCityLegalContext();

  return useMemo(
    () => ({
      cgu: buildCguDocument(cityContext),
      privacy: buildPrivacyDocument(cityContext),
      mentions: buildMentionsDocument(),
      cookies: buildCookiesDocument(),
      cityContext,
    }),
    [cityContext.cityName, cityContext.dataRetentionPolicy],
  );
}
