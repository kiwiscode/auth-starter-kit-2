import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user.emailVerified === false && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Your email is not verified. Please check your inbox!
          </Text>
        </View>
      )}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
        {user.fullname && (
          <>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{user.fullname}</Text>
          </>
        )}
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{user.id || user._id}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/settings")}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FF3B30", marginTop: 8 }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 24,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
    marginTop: 8,
  },
  value: {
    color: "#222",
    fontSize: 16,
    marginBottom: 4,
  },
  error: {
    color: "red",
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFEEBA",
    width: "100%",
  },
  warningText: {
    color: "#856404",
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
