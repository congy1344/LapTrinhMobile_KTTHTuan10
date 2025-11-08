import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [inputError, setInputError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editError, setEditError] = useState('');

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

  async function handleAddTodo() {
    if (!newTitle.trim()) {
      setInputError('Tiêu đề không được để trống');
      return;
    }
    setInputError('');
    try {
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO todos (title, done, created_at) VALUES (?, ?, ?)',
        [newTitle.trim(), 0, now]
      );
      setNewTitle('');
      setModalVisible(false);
      fetchTodos();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thêm công việc');
    }
  }

  async function handleEditTodo() {
    if (!editTitle.trim()) {
      setEditError('Tiêu đề không được để trống');
      return;
    }
    setEditError('');
    try {
      await db.runAsync('UPDATE todos SET title = ? WHERE id = ?', [editTitle.trim(), editId]);
      setEditModalVisible(false);
      setEditTitle('');
      setEditId(null);
      fetchTodos();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật công việc');
    }
  }

  async function handleToggleDone(id: number, done: number) {
    try {
      await db.runAsync('UPDATE todos SET done = ? WHERE id = ?', [done ? 0 : 1, id]);
      fetchTodos();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
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
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleToggleDone(item.id, item.done)}
                  onLongPress={() => {
                    setEditId(item.id);
                    setEditTitle(item.title);
                    setEditModalVisible(true);
                    setEditError('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.itemText, item.done ? styles.itemTextDone : null]}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Text style={styles.fabText}>＋</Text>
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Thêm công việc mới</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tiêu đề..."
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                  placeholderTextColor="#a0aec0"
                />
                {inputError ? <Text style={styles.inputError}>{inputError}</Text> : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleAddTodo}>
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setModalVisible(false); setInputError(''); setNewTitle(''); }}>
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={editModalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sửa tiêu đề công việc</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tiêu đề mới..."
                  value={editTitle}
                  onChangeText={setEditTitle}
                  autoFocus
                  placeholderTextColor="#a0aec0"
                />
                {editError ? <Text style={styles.inputError}>{editError}</Text> : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleEditTodo}>
                    <Text style={styles.modalButtonText}>Lưu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setEditModalVisible(false); setEditError(''); setEditTitle(''); setEditId(null); }}>
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#3182ce',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 20,
  },
  fabText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: -2,
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
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: '#a0aec0',
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#3182ce',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#3182ce',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#f7f9fc',
    color: '#222',
  },
  inputError: {
    color: '#e53e3e',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#3182ce',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginHorizontal: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#a0aec0',
  },
});
