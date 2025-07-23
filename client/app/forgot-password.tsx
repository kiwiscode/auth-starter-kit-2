import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import api from "@/constants/axiosConfig";

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleForgotPassword = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(
        res.data.message ||
          "If this email is registered, password reset instructions have been sent."
      );
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.info}>
        Enter your email address to receive password reset instructions.
      </Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor="#888"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={handleForgotPassword}
        disabled={loading || !email}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.replace("/login")}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: 16,
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "left",
  },
  info: {
    fontSize: 15,
    color: "#555",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#f8f8f8",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  success: {
    color: "green",
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 15,
  },
});

export default ForgotPasswordScreen;
