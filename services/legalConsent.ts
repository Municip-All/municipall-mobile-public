import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEGAL_CONSENT_VERSION } from '../constants/legalEntity';

const STORAGE_KEY = 'legal_consent_accepted_v1';

export type LegalConsentRecord = {
  version: string;
  acceptedAt: string;
  cgu: boolean;
  privacy: boolean;
  ageMin16: boolean;
};

export async function getLegalConsent(): Promise<LegalConsentRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LegalConsentRecord;
  } catch {
    return null;
  }
}

export async function recordLegalConsent(): Promise<void> {
  const record: LegalConsentRecord = {
    version: LEGAL_CONSENT_VERSION,
    acceptedAt: new Date().toISOString(),
    cgu: true,
    privacy: true,
    ageMin16: true,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function isConsentCurrent(record: LegalConsentRecord | null): boolean {
  return (
    record?.version === LEGAL_CONSENT_VERSION &&
    record.cgu &&
    record.privacy &&
    record.ageMin16 !== false
  );
}
