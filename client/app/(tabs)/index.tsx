import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 2000); // The logo disappears after 2 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/profile");
    }
  }, [authLoading, user, router]);

  if (showLogo) {
    return (
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topBar}>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.appName}>Your App</Text>
        <Text style={styles.description}>Your app description here.</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/register")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Join Us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "100%",
    height: "100%",
  },
  logo: {
    width: 80,
    height: 80,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    position: "absolute",
    left: 12,
    top: 60,
    zIndex: 2,
    width: 80,
    height: 80,
  },
  topLogo: {
    width: 80,
    height: 80,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingBottom: 60,
    paddingLeft: 16,
    paddingRight: 20,
  },
  appName: {
    fontSize: 30,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
    textAlign: "left",
  },
  description: {
    fontSize: 30,
    fontWeight: "600",
    color: "#444",
    marginBottom: 16,
    textAlign: "left",
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "flex-start",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginLeft: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
