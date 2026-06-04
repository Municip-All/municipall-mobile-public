import React from 'react';
import LegalDocumentScreen from '@components/LegalDocumentScreen';
import { useLegalDocuments } from '@hooks/useLegalDocuments';

export default function LegalPrivacyScreen() {
  const { privacy } = useLegalDocuments();
  return <LegalDocumentScreen document={privacy} />;
}
