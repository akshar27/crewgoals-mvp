import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { forgotPassword } from "../../src/api";
import { Input, PrimaryButton, SecondaryButton } from "../../src/components/ui";
import { styles } from "../../src/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await forgotPassword(email.trim());
      Alert.alert("Check your email", "If that account exists, a reset link has been sent.", [
        { text: "OK", onPress: () => router.back() },
      ]);
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
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.heroSub}>Enter your email and we&apos;ll send a link to set a new password.</Text>
          <View style={styles.card}>
            <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <PrimaryButton label={busy ? "Sending..." : "Send reset link"} onPress={submit} disabled={busy || !email.trim()} />
            <SecondaryButton label="Back to login" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
