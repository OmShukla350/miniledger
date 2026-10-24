import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { addLoan, Receipt } from '../api';
import { c, s } from '../theme';

const inDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

export default function AddLoanScreen({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [friendName, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDue] = useState(inDays(30));
  const [receipt, setReceipt] = useState<Receipt>();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (r.canceled) return;
    const a = r.assets[0];
    setReceipt({ uri: a.uri, name: a.fileName ?? 'receipt.jpg', type: a.mimeType ?? 'image/jpeg' });
  };

  const submit = async () => {
    const amt = Number(amount);
    if (!friendName.trim()) return setErr('Friend name is required');
    if (!(amt > 0)) return setErr('Enter an amount greater than 0');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return setErr('Due date must be YYYY-MM-DD');
    setBusy(true); setErr('');
    try { await addLoan({ friendName: friendName.trim(), amount, dueDate }, receipt); onDone(); }
    catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>New entry</Text>
      <Text style={s.label}>Friend name</Text>
      <TextInput style={s.input} value={friendName} onChangeText={setName} placeholder="Rahul" />
      <Text style={s.label}>Amount (₹)</Text>
      <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="1500" />
      <Text style={s.label}>Due date (YYYY-MM-DD)</Text>
      <TextInput style={s.input} value={dueDate} onChangeText={setDue} placeholder="2026-12-31" autoCapitalize="none" />
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        {[7, 30, 90].map((n) => <Pressable key={n} onPress={() => setDue(inDays(n))}><Text style={{ color: c.primary }}>+{n}d</Text></Pressable>)}
        <Pressable onPress={() => setDue(inDays(-3))}><Text style={{ color: c.danger }}>(demo) 3d ago</Text></Pressable>
      </View>

      <Pressable onPress={pick}><Text style={[s.link, { textAlign: 'left', marginTop: 20 }]}>{receipt ? 'Change receipt photo' : '+ Attach receipt photo (optional)'}</Text></Pressable>
      {receipt && <Image source={{ uri: receipt.uri }} style={{ height: 160, marginTop: 10, borderRadius: 8 }} resizeMode="contain" />}

      {!!err && <Text style={s.error}>{err}</Text>}
      <Pressable style={[s.btn, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Save entry</Text>}
      </Pressable>
      <Pressable onPress={onCancel}><Text style={s.link}>Cancel</Text></Pressable>
    </ScrollView>
  );
}
