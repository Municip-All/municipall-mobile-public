import { StyleSheet, Text, View } from 'react-native';

export default function CityMap() {
  return (
    <View style={styles.centered}>
      <Text style={styles.text}>Carte non disponible sur le web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#71717a' },
});
