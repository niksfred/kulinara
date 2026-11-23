import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GroceryItem, GrocerySource } from '../../types/GroceryItem';
import { getDefaultExpirationDays } from '../../constants/expirationDefaults';
import { addDays, formatDate, toStoredDate } from '../../utils/date';
import { createItem, getItem, updateItem } from '../../storage/items';
import { cancelForItem, scheduleForItem } from '../../services/notificationService';

function createId() {
  return `item_${Date.now()}_${Math.round(Math.random() * 100000)}`;
}

export default function AddEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<GrocerySource>('manual');
  const [date, setDate] = useState<Date>(() =>
    addDays(new Date(), getDefaultExpirationDays(''))
  );
  const [createdAt, setCreatedAt] = useState<string>(() => new Date().toISOString());
  const [dateDirty, setDateDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing || !id) return;
    let active = true;
    setLoading(true);
    getItem(id)
      .then((item) => {
        if (!active || !item) return;
        setName(item.name);
        setWeight(item.weight ?? '');
        setNotes(item.notes ?? '');
        setSource(item.source);
        setDate(new Date(item.expirationDate));
        setCreatedAt(item.createdAt);
        setDateDirty(true);
      })
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isEditing]);

  const helperText = useMemo(() => {
    if (loading) return 'Loading item...';
    return isEditing ? 'Update grocery item details.' : 'Add a new grocery item.';
  }, [isEditing, loading]);

  const onChangeName = (value: string) => {
    setName(value);
    if (!dateDirty) {
      const days = getDefaultExpirationDays(value);
      setDate(addDays(new Date(), days));
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Enter a grocery item name.');
      return;
    }
    const item: GroceryItem = {
      id: id ?? createId(),
      name: name.trim(),
      weight: weight.trim() ? weight.trim() : undefined,
      expirationDate: toStoredDate(date),
      notes: notes.trim() ? notes.trim() : undefined,
      createdAt,
      source,
    };

    setLoading(true);
    try {
      if (isEditing) {
        await cancelForItem(item.id);
        await updateItem(item);
      } else {
        await createItem(item);
      }
      await scheduleForItem(item);
      router.back();
    } catch {
      Alert.alert('Save failed', 'Could not save this item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Item' : 'Add Item'}</Text>
      <Text style={styles.helperText}>{helperText}</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Milk"
        value={name}
        onChangeText={onChangeName}
      />

      <Text style={styles.label}>Weight</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1 kg"
        value={weight}
        onChangeText={setWeight}
      />

      <Text style={styles.label}>Expiration Date</Text>
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{formatDate(toStoredDate(date))}</Text>
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(_, selected) => {
            if (!selected) return;
            setDateDirty(true);
            setDate(selected);
          }}
        />
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Optional notes"
        multiline
        value={notes}
        onChangeText={setNotes}
      />

      <Pressable style={styles.saveButton} onPress={onSave} disabled={loading}>
        <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateText: {
    marginBottom: 8,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
