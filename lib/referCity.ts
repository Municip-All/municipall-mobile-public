import { Linking } from 'react-native';

export function openReferCityEmail(): void {
  const subject = encodeURIComponent("Suggestion d'adoption de la solution Municip'All");
  const body = encodeURIComponent(
    'Monsieur le Maire / Madame la Maire,\n\n' +
      "En tant que citoyen engagé, je souhaiterais vous suggérer d'adopter la solution Municip'All pour faciliter la communication entre les services municipaux et les habitants.\n\n" +
      "Cette solution permet de signaler des incidents en temps réel, de suivre les travaux et d'être alerté des événements importants de notre ville.\n\n" +
      "Plusieurs villes partenaires l'utilisent déjà avec succès. Vous pouvez trouver plus d'informations sur https://municipall.dev\n\n" +
      'En espérant que cette suggestion retiendra votre attention.\n\n' +
      'Bien cordialement,'
  );
  void Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
}
