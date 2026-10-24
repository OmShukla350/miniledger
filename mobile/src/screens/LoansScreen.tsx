import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { fetchLoans, fetchSummary, Loan, markRepaid, Summary, UnauthorizedError } from '../api';
import LoanItem from '../components/LoanItem';
import SummaryCard from '../components/SummaryCard';
import { c, s } from '../theme';

type Props = { onAdd: () => void; onLogout: () => void; refreshKey: number };

export default function LoansScreen({ onAdd, onLogout, refreshKey }: Props) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      const [l, sm] = await Promise.all([fetchLoans(), fetchSummary()]);
      setLoans(l); setSummary(sm); setErr('');
    } catch (e) {
      if (e instanceof UnauthorizedError) return onLogout();
      setErr((e as Error).message);
    } finally { setLoading(false); setRefreshing(false); }
  }, [onLogout]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const repay = async (id: string) => {
    try { await markRepaid(id); await load(); } catch (e) { setErr((e as Error).message); }
  };

  if (loading) return <View style={[s.screen, { justifyContent: 'center' }]}><ActivityIndicator size="large" color={c.primary} /></View>;

  return (
    <View style={s.screen}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingTop: 56 }}
        data={loans}
        keyExtractor={(l) => l.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListHeaderComponent={
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={s.title}>My ledger</Text>
              <Pressable onPress={onLogout}><Text style={{ color: c.muted }}>Logout</Text></Pressable>
            </View>
            <SummaryCard data={summary} />
            {!!err && <Text style={s.error}>{err}</Text>}
          </>
        }
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: c.muted, marginTop: 30 }}>No entries yet. Tap + to add one.</Text>}
        renderItem={({ item }) => <LoanItem loan={item} onRepay={repay} />}
      />
      <Pressable onPress={onAdd} style={{ position: 'absolute', right: 20, bottom: 30, width: 58, height: 58, borderRadius: 29, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 }}>
        <Text style={{ color: '#fff', fontSize: 32, marginTop: -2 }}>+</Text>
      </Pressable>
    </View>
  );
}
