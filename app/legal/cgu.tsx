import React from 'react';
import LegalDocumentScreen from '@components/LegalDocumentScreen';
import { useLegalDocuments } from '@hooks/useLegalDocuments';

export default function LegalCguScreen() {
  const { cgu } = useLegalDocuments();
  return <LegalDocumentScreen document={cgu} />;
}
