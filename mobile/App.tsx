import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { clearToken, getToken } from './src/api';
import AddLoanScreen from './src/screens/AddLoanScreen';
import LoansScreen from './src/screens/LoansScreen';
import LoginScreen from './src/screens/LoginScreen';

type Screen = 'boot' | 'login' | 'list' | 'add';

export default function App() {
  const [screen, setScreen] = useState<Screen>('boot');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { getToken().then((t) => setScreen(t ? 'list' : 'login')); }, []);
  const logout = useCallback(async () => { await clearToken(); setScreen('login'); }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {screen === 'boot' && <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>}
      {screen === 'login' && <LoginScreen onLoggedIn={() => setScreen('list')} />}
      {screen === 'list' && <LoansScreen refreshKey={refreshKey} onAdd={() => setScreen('add')} onLogout={logout} />}
      {screen === 'add' && <AddLoanScreen onCancel={() => setScreen('list')} onDone={() => { setRefreshKey((k) => k + 1); setScreen('list'); }} />}
    </View>
  );
}
