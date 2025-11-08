import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { initDB } from './db';

export default function App() {
  useEffect(() => {
    initDB()
      .then(() => console.log('Database initialized'))
      .catch(err => console.error('DB init error', err));
  }, []);

  return (
    <View>
      <Text>Todo app</Text>
    </View>
  );
}