import { useState, useCallback, useMemo } from 'react';
import db from '../db';

export interface Todo {
  id: number;
  title: string;
  done: number;
  created_at: number;
}

function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      const result = await db.getAllAsync('SELECT * FROM todos ORDER BY created_at DESC') as Todo[];
      setTodos(result);
      setError(null);
    } catch (err) {
      setTodos([]);
      setError('Lỗi tải danh sách');
    }
    setLoading(false);
  }, []);

  const addTodo = useCallback(async (title: string) => {
    if (!title.trim()) throw new Error('Tiêu đề không được để trống');
    const now = Date.now();
    await db.runAsync('INSERT INTO todos (title, done, created_at) VALUES (?, ?, ?)', [title.trim(), 0, now]);
    await loadTodos();
  }, [loadTodos]);

  const editTodo = useCallback(async (id: number, title: string) => {
    if (!title.trim()) throw new Error('Tiêu đề không được để trống');
    await db.runAsync('UPDATE todos SET title = ? WHERE id = ?', [title.trim(), id]);
    await loadTodos();
  }, [loadTodos]);

  const toggleDone = useCallback(async (id: number, done: number) => {
    await db.runAsync('UPDATE todos SET done = ? WHERE id = ?', [done ? 0 : 1, id]);
    await loadTodos();
  }, [loadTodos]);

  const deleteTodo = useCallback(async (id: number) => {
    await db.runAsync('DELETE FROM todos WHERE id = ?', [id]);
    await loadTodos();
  }, [loadTodos]);

  const importFromAPI = useCallback(async () => {
    setSyncLoading(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10');
      if (!response.ok) throw new Error('Fetch thất bại');
      const apiTodos = await response.json();
      const existingTitles = new Set(todos.map(t => t.title));
      for (const todo of apiTodos) {
        if (existingTitles.has(todo.title)) continue;
        await db.runAsync('INSERT INTO todos (title, done, created_at) VALUES (?, ?, ?)', [todo.title, todo.completed ? 1 : 0, Date.now()]);
      }
      await loadTodos();
    } catch (err) {
      setError('Không thể đồng bộ từ API');
    }
    setSyncLoading(false);
  }, [todos, loadTodos]);

  return {
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
  };
}

export default useTodos;
