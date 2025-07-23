import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import api from "@/constants/axiosConfig";

export default function SettingsScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleChangePassword = async () => {
    setChanging(true);
    setMessage("");
    setError("");
    if (newPassword !== newPasswordRepeat) {
      setError("New passwords do not match");
      setChanging(false);
      return;
    }
    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      setMessage("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setNewPasswordRepeat("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to change password");
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.info}>
        This is a protected settings page. Only logged in users can see this.
      </Text>
      <View style={styles.changeBox}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput
          placeholder="Old Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Repeat New Password"
          value={newPasswordRepeat}
          onChangeText={setNewPasswordRepeat}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#888"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <TouchableOpacity
          style={styles.button}
          onPress={handleChangePassword}
          disabled={changing}
          activeOpacity={0.8}
        >
          {changing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 24,
  },
  info: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    marginBottom: 32,
  },
  changeBox: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fff",
    width: "100%",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 8,
    textAlign: "center",
  },
  success: {
    color: "green",
    marginBottom: 8,
    textAlign: "center",
  },
});
