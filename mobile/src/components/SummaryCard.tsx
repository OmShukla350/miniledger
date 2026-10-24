import { StyleSheet, Text, View } from 'react-native';
import { Summary } from '../api';
import { c, inr } from '../theme';

export default function SummaryCard({ data }: { data: Summary | null }) {
  const d = data ?? { totalLent: 0, totalRepaid: 0, totalPending: 0, overdueAmount: 0, overdueCount: 0 };
  return (
    <View style={st.card}>
      <Text style={st.cap}>Total lent</Text>
      <Text style={st.big}>{inr(d.totalLent)}</Text>
      <View style={st.row}>
        <Stat label="Repaid" value={inr(d.totalRepaid)} color="#B2F2BB" />
        <Stat label="Pending" value={inr(d.totalPending)} color="#fff" />
        <Stat label={`Overdue (${d.overdueCount})`} value={inr(d.overdueAmount)} color="#FFA8A8" />
      </View>
    </View>
  );
}
const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={{ flex: 1 }}>
    <Text style={st.cap}>{label}</Text>
    <Text style={[st.val, { color }]}>{value}</Text>
  </View>
);
const st = StyleSheet.create({
  card: { backgroundColor: c.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  cap: { color: '#DBE4FF', fontSize: 12 },
  big: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 4 },
  row: { flexDirection: 'row', marginTop: 14 },
  val: { fontSize: 15, fontWeight: '700', marginTop: 2 },
});
