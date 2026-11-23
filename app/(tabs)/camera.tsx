import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { classifyImage } from '../../services/classificationService';
import { createItem } from '../../storage/items';
import { addDays, parseDateInput, toStoredDate } from '../../utils/date';
import { scheduleForItem } from '../../services/notificationService';
import { GroceryItem } from '../../types/GroceryItem';

type EditableItem = {
  id: string;
  name: string;
  weight: string;
  expiration: string;
};

type SelectedImage = {
  uri: string;
  width: number;
  height: number;
};

function createId() {
  return `photo_${Date.now()}_${Math.round(Math.random() * 100000)}`;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CameraScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const processImage = async (image: SelectedImage) => {
    setLoading(true);
    setStatusText(null);
    try {
      const detected = await classifyImage(image);
      if (!detected.length) {
        setItems([]);
        setStatusText('No food items were found in this image.');
        Alert.alert('No food found', 'No grocery items were detected in this image.');
        return;
      }
      setItems(
        detected.map((item) => ({
          id: createId(),
          name: item.name,
          weight: '',
          expiration: toDateInput(addDays(new Date(), item.expirationDays)),
        }))
      );
    } catch (error) {
      setItems([]);
      const message =
        error instanceof Error ? error.message : 'Could not process photo. Please try again.';
      setStatusText(message);
      Alert.alert('Photo error', message);
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const available = await ImagePicker.getCameraPermissionsAsync();
        if (!available.canAskAgain && available.status !== 'granted') {
          Alert.alert('Camera unavailable', 'Enable camera access in system settings.');
          return;
        }
      }

      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', 'Enable permission to select a photo.');
        return;
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 1 })
          : await ImagePicker.launchImageLibraryAsync({ quality: 1 });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setImageUri(asset.uri);
      const image: SelectedImage = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      };
      setSelectedImage(image);
      await processImage(image);
    } catch {
      Alert.alert('Photo error', 'Could not open camera/gallery. Please try again.');
    }
  };

  const updateItem = (id: string, key: keyof EditableItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const saveItems = async () => {
    if (!items.length) {
      Alert.alert('No items', 'Nothing to save yet.');
      return;
    }
    setLoading(true);
    try {
      for (const item of items) {
        if (!item.name.trim()) continue;
        const parsedDate = parseDateInput(item.expiration);
        if (!parsedDate) {
          Alert.alert('Invalid expiration', `Use YYYY-MM-DD for ${item.name}.`);
          setLoading(false);
          return;
        }
        const grocery: GroceryItem = {
          id: item.id,
          name: item.name.trim(),
          weight: item.weight.trim() ? item.weight.trim() : undefined,
          expirationDate: toStoredDate(parsedDate),
          createdAt: new Date().toISOString(),
          source: 'photo',
        };
        await createItem(grocery);
        await scheduleForItem(grocery);
      }
      router.back();
    } catch {
      Alert.alert('Save failed', 'Could not save detected items.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Photo Capture</Text>
      <Text style={styles.helperText}>
        Capture a photo or choose one to detect grocery items.
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => handlePick('camera')}>
          <Text style={styles.actionText}>Take Photo</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => handlePick('library')}>
          <Text style={styles.actionText}>Choose Photo</Text>
        </Pressable>
      </View>

      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
      {imageUri ? (
        <Pressable
          style={styles.retryButton}
          onPress={() => selectedImage && void processImage(selectedImage)}
          disabled={loading || !selectedImage}
        >
          <Text style={styles.retryText}>{loading ? 'Processing...' : 'Try Again'}</Text>
        </Pressable>
      ) : null}

      {loading ? <Text style={styles.loadingText}>Processing...</Text> : null}
      {statusText ? <Text style={styles.statusText}>{statusText}</Text> : null}

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <TextInput
            style={styles.itemInput}
            value={item.name}
            placeholder="Name"
            onChangeText={(value) => updateItem(item.id, 'name', value)}
          />
          <TextInput
            style={styles.itemInput}
            value={item.weight}
            placeholder="Weight (optional)"
            onChangeText={(value) => updateItem(item.id, 'weight', value)}
          />
          <TextInput
            style={styles.itemInput}
            value={item.expiration}
            placeholder="Expiration (YYYY-MM-DD)"
            onChangeText={(value) => updateItem(item.id, 'expiration', value)}
          />
          <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ))}

      {items.length ? (
        <Pressable style={styles.saveButton} onPress={saveItems} disabled={loading}>
          <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Items'}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  helperText: {
    color: '#6b7280',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginBottom: 12,
    color: '#6b7280',
  },
  statusText: {
    marginBottom: 12,
    color: '#6b7280',
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#111827',
    fontWeight: '600',
  },
  itemRow: {
    gap: 8,
    marginBottom: 12,
  },
  itemInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  removeText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
