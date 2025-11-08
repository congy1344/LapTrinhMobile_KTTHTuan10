import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import db from '../db';

interface Todo {
  id: number;
  title: string;
  done: number;
  created_at: number;
}

export default function TodoListScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setLoading(true);
    try {
      const result = await db.getAllAsync('SELECT * FROM todos ORDER BY created_at DESC') as Todo[];
      setTodos(result);
    } catch (err) {
      console.error('Fetch todos error', err);
      setTodos([]);
    }
    setLoading(false);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>📝 Danh sách công việc</Text>
          {loading ? (
            <Text style={styles.loading}>Đang tải...</Text>
          ) : todos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.empty}>Chưa có việc nào</Text>
            </View>
          ) : (
            <FlatList
              data={todos}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text style={styles.itemIcon}>✅</Text>
                  <Text style={styles.itemText}>{item.title}</Text>
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: '#f7f9fc',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#2d3748',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888',
    fontSize: 18,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  itemText: {
    fontSize: 18,
    color: '#222',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 20,
    fontWeight: '500',
  },
});
