import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Button from "./Button.js";

export default function BuddiesRequired() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Add a buddy to post their reaction</Text>
      <Button
        title={"Go to add buddies"}
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
