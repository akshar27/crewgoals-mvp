import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "../../src/components/ui";
import { useAuth } from "../../src/hooks/useAuth";
import { styles } from "../../src/theme";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      if (mode === "login") await signIn(email.trim(), password);
      else await signUp(name.trim(), email.trim(), password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Unable to continue", error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.authWrap}>
          <Text style={styles.hero}>Find your crew. Build your goal.</Text>
          <Text style={styles.heroSub}>Small local groups matched by goal, level, schedule, location, and vibe.</Text>
          <View style={styles.card}>
            <View style={styles.segment}>
              <Pressable style={[styles.segmentButton, mode === "login" && styles.segmentActive]} onPress={() => setMode("login")}>
                <Text style={styles.segmentText}>Login</Text>
              </Pressable>
              <Pressable style={[styles.segmentButton, mode === "signup" && styles.segmentActive]} onPress={() => setMode("signup")}>
                <Text style={styles.segmentText}>Signup</Text>
              </Pressable>
            </View>
            {mode === "signup" ? <Input label="Name" value={name} onChangeText={setName} /> : null}
            <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Pressable style={[styles.primaryButton, busy && { opacity: 0.5 }]} onPress={submit} disabled={busy}>
              <Text style={styles.primaryText}>{busy ? "Working..." : mode === "login" ? "Log in" : "Create account"}</Text>
            </Pressable>
            <Link href="/(auth)/forgot-password" style={styles.ghostButton}>
              <Text style={styles.ghostText}>Forgot password?</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
