import React from 'react';
import LegalDocumentScreen from '@components/LegalDocumentScreen';
import { useLegalDocuments } from '@hooks/useLegalDocuments';

export default function LegalMentionsScreen() {
  const { mentions } = useLegalDocuments();
  return <LegalDocumentScreen document={mentions} />;
}
