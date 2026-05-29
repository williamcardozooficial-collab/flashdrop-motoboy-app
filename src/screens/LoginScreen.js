import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "https://flashdrop-backend-production.up.railway.app";

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha usuario e senha");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API + "/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.role === "motoboy") {
        await AsyncStorage.setItem("flashdrop_user", JSON.stringify(data));
        onLogin(data);
      } else if (res.ok && data.role !== "motoboy") {
        Alert.alert("Acesso negado", "Este app e apenas para motoboys.");
      } else {
        Alert.alert("Erro", data.error || "Usuario ou senha invalidos");
      }
    } catch (e) {
      Alert.alert("Sem conexao", "Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.logo}>FlashDrop</Text>
          <Text style={s.sub}>Area do Motoboy</Text>
        </View>
        <View style={s.form}>
          <Text style={s.label}>Usuario</Text>
          <TextInput style={s.input} placeholder="Digite seu usuario" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
          <Text style={s.label}>Senha</Text>
          <TextInput style={s.input} placeholder="Digite sua senha" value={password} onChangeText={setPassword} secureTextEntry />
          <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={s.btnTxt}>Entrar</Text>}
          </TouchableOpacity>
        <View style={s.registerRow}>
          <Text style={s.registerTxt}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://flashdrop-frontend-six.vercel.app/register.html')}>
            <Text style={s.registerLink}>Cadastre-se aqui</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#764ba2" },
  scroll: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 32 },
  logo: { fontSize: 40, fontWeight: "bold", color: "#fff" },
  sub: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 6 },
  form: { width: "100%", backgroundColor: "#fff", borderRadius: 20, padding: 28 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 2, borderColor: "#e0e0e0", borderRadius: 10, padding: 14, fontSize: 16 },
  btn: { backgroundColor: "#667eea", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 24 },
  btnOff: { backgroundColor: "#ccc" },
  btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  registerTxt: { fontSize: 14, color: "#666" },
  registerLink: { fontSize: 14, color: "#667eea", fontWeight: "700" },
});
