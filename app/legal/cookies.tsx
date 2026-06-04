import React from 'react';
import LegalDocumentScreen from '@components/LegalDocumentScreen';
import { useLegalDocuments } from '@hooks/useLegalDocuments';

export default function LegalCookiesScreen() {
  const { cookies } = useLegalDocuments();
  return <LegalDocumentScreen document={cookies} />;
}
