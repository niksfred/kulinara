import { StyleSheet, Text, View } from 'react-native';
import { Fonts, FontSizes } from '@/constants/fonts';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.extraLarge,
  },
});
