import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { GroceryItem } from '../../types/GroceryItem';
import { cancelForItem } from '../../services/notificationService';
import { deleteItem, listItems } from '../../storage/items';
import { daysUntil, formatDate } from '../../utils/date';

const EXPIRING_SOON_DAYS = 3;

export default function GroceryListScreen() {
  const router = useRouter();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const results = await listItems();
      setItems(results);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadItems();
    }, [loadItems])
  );

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading items...';
    return 'No items yet. Add groceries to get started.';
  }, [loading]);

  const onDelete = useCallback(
    (item: GroceryItem) => {
      Alert.alert('Delete item', `Remove ${item.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelForItem(item.id);
            await deleteItem(item.id);
            await loadItems();
          },
        },
      ]);
    },
    [loadItems]
  );

  const renderItem = ({ item }: { item: GroceryItem }) => {
    const daysLeft = daysUntil(item.expirationDate);
    const isExpired = daysLeft < 0;
    const isExpiringSoon = daysLeft <= EXPIRING_SOON_DAYS && daysLeft >= 0;

    return (
      <Pressable
        style={[
          styles.card,
          isExpired && styles.cardExpired,
          isExpiringSoon && styles.cardSoon,
        ]}
        onPress={() => {
          router.push({ pathname: '/(tabs)/add-edit', params: { id: item.id } });
        }}
        onLongPress={() => onDelete(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDate}>{formatDate(item.expirationDate)}</Text>
        </View>
        <Text style={styles.cardSubtitle}>
          {isExpired ? 'Expired' : `${daysLeft} days left`}
        </Text>
        {item.weight ? <Text style={styles.cardWeight}>{item.weight}</Text> : null}
        {item.notes ? <Text style={styles.cardNotes}>{item.notes}</Text> : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grocery List</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/camera')}
          >
            <Text style={styles.actionText}>Camera</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/add-edit')}
          >
            <Text style={styles.actionText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
      />
      <Text style={styles.helperText}>
        Tip: Long-press an item to delete it.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
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
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    color: '#6b7280',
    marginTop: 32,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardExpired: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  cardSoon: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDate: {
    color: '#6b7280',
  },
  cardSubtitle: {
    color: '#111827',
    fontWeight: '500',
  },
  cardNotes: {
    marginTop: 6,
    color: '#4b5563',
  },
  cardWeight: {
    marginTop: 6,
    color: '#374151',
    fontWeight: '500',
  },
  helperText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
  },
});
