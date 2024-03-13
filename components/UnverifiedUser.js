import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Button from "./Button.js";

export default function UnverifiedUser() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Sign in with verified email address to post</Text>
      <Button
            title={"Go to sign in"}
            onPress={() => {
              router.replace("/settings");
            }}
            color={"#2196F3"}
          />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
});
