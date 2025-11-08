import React, { useEffect } from 'react';
import { initDB, seedTodos } from './db';
import TodoListScreen from './screens/TodoListScreen';

export default function App() {
  useEffect(() => {
    async function setupDB() {
      try {
        await initDB();
        await seedTodos();
      } catch (err) {
        console.error('DB init/seed error', err);
      }
    }
    setupDB();
  }, []);

  return <TodoListScreen />;
}