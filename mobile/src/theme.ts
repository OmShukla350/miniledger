import { StyleSheet } from 'react-native';
export const c = { bg: '#F5F6FA', card: '#FFFFFF', primary: '#3B5BDB', text: '#1B1F3B', muted: '#6B7280', danger: '#D6336C', dangerBg: '#FFF0F6', ok: '#2F9E44', border: '#E5E7EB' };
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  pad: { padding: 20 },
  title: { fontSize: 26, fontWeight: '700', color: c.text, marginBottom: 6 },
  sub: { color: c.muted, marginBottom: 20 },
  label: { color: c.muted, fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 14, fontSize: 16, color: c.text },
  btn: { backgroundColor: c.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 22 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { color: c.primary, textAlign: 'center', marginTop: 16 },
  error: { color: c.danger, marginTop: 12 },
});
