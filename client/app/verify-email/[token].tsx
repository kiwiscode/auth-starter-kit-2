import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "@/constants/axiosConfig";
import { useAuth } from "@/context/AuthContext";

const VerifyEmailScreen: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || typeof token !== "string") {
      if (user) {
        router.back();
      } else {
        router.replace("/login");
      }
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setTimeout(() => {
          setStatus("success");
          setMessage(res.data.message || "Email successfully verified!");
        }, 1000);
        setTimeout(() => {
          if (user) {
            router.replace("/profile");
          } else {
            router.replace("/login");
          }
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.error || "Verification failed or token expired."
        );
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      {status === "pending" && (
        <>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.text}>Verifying...</Text>
        </>
      )}
      {status === "success" && (
        <Text style={[styles.text, { color: "green" }]}>{message}</Text>
      )}
      {status === "error" && (
        <Text style={[styles.text, { color: "red" }]}>{message}</Text>
      )}
      {status === "success" && (
        <Text style={styles.text}>
          Redirecting to {user ? "profile" : "login"}...
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  text: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});

export default VerifyEmailScreen;
