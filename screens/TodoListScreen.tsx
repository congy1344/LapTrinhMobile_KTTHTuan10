import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import useTodos from './useTodos';

export default function TodoListScreen() {
  const {
    todos,
    loading,
    error,
    syncLoading,
    loadTodos,
    addTodo,
    editTodo,
    toggleDone,
    deleteTodo,
    importFromAPI,
  } = useTodos();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [inputError, setInputError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editError, setEditError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const filteredTodos = useMemo(() => {
    if (!search.trim()) return todos;
    const lower = search.trim().toLowerCase();
    return todos.filter(todo => todo.title.toLowerCase().includes(lower));
  }, [search, todos]);

  const handleAdd = useCallback(async () => {
    if (!newTitle.trim()) {
      setInputError('Tiêu đề không được để trống');
      return;
    }
    setInputError('');
    try {
      await addTodo(newTitle);
      setNewTitle('');
      setModalVisible(false);
    } catch (err: any) {
      setInputError(err.message || 'Lỗi thêm công việc');
    }
  }, [newTitle, addTodo]);

  const handleEdit = useCallback(async () => {
    if (!editTitle.trim()) {
      setEditError('Tiêu đề không được để trống');
      return;
    }
    setEditError('');
    try {
      await editTodo(editId!, editTitle);
      setEditModalVisible(false);
      setEditTitle('');
      setEditId(null);
      Alert.alert('Thành công', 'Đã sửa tiêu đề công việc!');
    } catch (err: any) {
      setEditError(err.message || 'Lỗi cập nhật công việc');
    }
  }, [editTitle, editId, editTodo]);

  const handleToggle = useCallback(async (id: number, done: number) => {
    await toggleDone(id, done);
  }, [toggleDone]);

  const handleDelete = useCallback((id: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa công việc này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa', style: 'destructive', onPress: async () => {
            await deleteTodo(id);
          }
        }
      ]
    );
  }, [deleteTodo]);

  const handleImport = useCallback(async () => {
    await importFromAPI();
  }, [importFromAPI]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemRow}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => handleToggle(item.id, item.done)}
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
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleToggle, handleDelete]
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>📝 Danh sách công việc</Text>
          <TouchableOpacity style={styles.syncButton} onPress={handleImport} disabled={syncLoading}>
            <Text style={styles.syncButtonText}>{syncLoading ? 'Đang đồng bộ...' : 'Đồng bộ API'}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#a0aec0"
            editable={!loading}
          />
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⏳</Text>
              <Text style={styles.empty}>Đang tải dữ liệu...</Text>
            </View>
          ) : filteredTodos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.empty}>Chưa có việc nào. Hãy thêm mới hoặc đồng bộ!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTodos}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTodos} />}
            />
          )}
          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} disabled={loading || syncLoading}>
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
                  editable={!loading}
                />
                {inputError ? <Text style={styles.inputError}>{inputError}</Text> : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleAdd} disabled={loading}>
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
                  editable={!loading}
                />
                {editError ? <Text style={styles.inputError}>{editError}</Text> : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalButton} onPress={handleEdit} disabled={loading}>
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
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
  deleteButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e53e3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    color: '#222',
  },
  syncButton: {
    backgroundColor: '#38a169',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
