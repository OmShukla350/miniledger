import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { API_URL, authHeader, Loan } from '../api';
import { c, inr } from '../theme';

export default function LoanItem({ loan, onRepay }: { loan: Loan; onRepay: (id: string) => void }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const repaid = !!loan.repaidAt;
  const confirm = () =>
    Alert.alert('Mark as repaid?', `${loan.friendName} paid back ${inr(loan.amount)}.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => onRepay(loan.id) },
    ]);

  return (
    <View style={[st.card, loan.isOverdue && st.overdue, repaid && st.repaid]}>
      <View style={st.top}>
        <Text style={st.name}>{loan.friendName}</Text>
        <Text style={st.amt}>{inr(loan.amount)}</Text>
      </View>
      <Text style={[st.due, loan.isOverdue && { color: c.danger, fontWeight: '700' }]}>
        {repaid ? `Repaid on ${loan.repaidAt!.slice(0, 10)}` : loan.isOverdue ? `OVERDUE · was due ${loan.dueDate}` : `Due ${loan.dueDate}`}
      </Text>
      <View style={st.actions}>
        {loan.hasReceipt && (
          <Pressable onPress={() => setShowReceipt((v) => !v)}>
            <Text style={st.action}>{showReceipt ? 'Hide receipt' : 'View receipt'}</Text>
          </Pressable>
        )}
        {!repaid && (
          <Pressable onPress={confirm}>
            <Text style={[st.action, { color: c.ok }]}>Mark repaid</Text>
          </Pressable>
        )}
      </View>
      {showReceipt && (
        <Image source={{ uri: `${API_URL}/loans/${loan.id}/receipt`, headers: authHeader() }} style={st.img} resizeMode="contain" />
      )}
    </View>
  );
}
const st = StyleSheet.create({
  card: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: c.border },
  overdue: { backgroundColor: c.dangerBg, borderLeftColor: c.danger },
  repaid: { opacity: 0.6, borderLeftColor: c.ok },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 17, fontWeight: '600', color: c.text },
  amt: { fontSize: 17, fontWeight: '700', color: c.text },
  due: { color: c.muted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 10 },
  action: { color: c.primary, fontWeight: '600' },
  img: { width: '100%', height: 220, marginTop: 10, borderRadius: 8, backgroundColor: '#eee' },
});
