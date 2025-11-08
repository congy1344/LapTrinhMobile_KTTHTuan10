import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { initDB, seedTodos } from './db';

export default function App() {
  useEffect(() => {
    async function setupDB() {
      try {
        await initDB();
        await seedTodos();
        console.log('Database initialized and seeded');
      } catch (err) {
        console.error('DB init/seed error', err);
      }
    }
    setupDB();
  }, []);

  return (
    <View>
      <Text>Todo app</Text>
    </View>
  );
}