import React, { useState } from "react";
import { View, TextInput, Alert, StyleSheet, Text } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import Button from "../components/Button.js";

const PasswordReset = ({ setTogglePasswordReset }) => {
  const [email, setEmail] = useState("");

  const resetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        // Password reset email sent successfully
        Alert.alert(
          "Password Reset Email Sent",
          "Check your email inbox or spam to reset your password."
        );
      })
      .catch((error) => {
        // Handle password reset errors
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title="Request password reset"
        onPress={resetPassword}
        color="#2196F3"
      />
      <Text
        style={styles.textToggle}
        onPress={() => setTogglePasswordReset(false)}
      >
        {"Password changed? Sign In"}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "black",
  },
  textToggle: {
    padding: 10,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "blue",
  },
});
export default PasswordReset;
