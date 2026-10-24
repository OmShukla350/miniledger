import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput } from 'react-native';
import { requestOtp, saveToken, verifyOtp } from '../api';
import { s } from '../theme';

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setErr('');
    try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const send = () => run(async () => { await requestOtp(phone.trim()); setSent(true); });
  const verify = () => run(async () => { const r = await verifyOtp(phone.trim(), otp.trim()); await saveToken(r.token); onLoggedIn(); });

  return (
    <KeyboardAvoidingView style={[s.screen, s.pad, { justifyContent: 'center' }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={s.title}>MiniLedger</Text>
      <Text style={s.sub}>Track money you've lent to friends.</Text>

      <Text style={s.label}>Phone number</Text>
      <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!sent} placeholder="+919876543210" />

      {sent && (
        <>
          <Text style={s.label}>6-digit OTP (printed in the server log)</Text>
          <TextInput style={s.input} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="123456" autoFocus />
        </>
      )}

      <Pressable style={[s.btn, busy && { opacity: 0.6 }]} disabled={busy} onPress={sent ? verify : send}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{sent ? 'Verify & Login' : 'Send OTP'}</Text>}
      </Pressable>
      {sent && <Pressable onPress={() => { setSent(false); setOtp(''); setErr(''); }}><Text style={s.link}>Change number / resend</Text></Pressable>}
      {!!err && <Text style={s.error}>{err}</Text>}
    </KeyboardAvoidingView>
  );
}
