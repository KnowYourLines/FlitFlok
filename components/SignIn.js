import React, { useState } from "react";
import { View, TextInput, Alert, StyleSheet, Text } from "react-native";
import {
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import Button from "../components/Button.js";

export default function SignIn({ updateUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toggleSignUp, setToggleSignUp] = useState(false);

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
      Alert.alert("Error", error.message);
    });
  };

  const signUp = () => {
    const anonUser = auth.currentUser;
    const credential = EmailAuthProvider.credential(email, password);
    linkWithCredential(anonUser, credential)
      .then((usercred) => {
        const user = usercred.user;
        sendEmailVerification(user);
        updateUser({ ...user });
      })
      .catch((error) => {
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
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      {toggleSignUp ? (
        <View style={styles.container}>
          <Button title="Create Account" onPress={signUp} color="#2196F3" />
          <Text
            style={styles.textToggle}
            onPress={() => setToggleSignUp(!toggleSignUp)}
          >
            {"Already have an account? Sign In"}
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <Button title="Sign In" onPress={signIn} color="#2196F3" />
          <Text
            style={styles.textToggle}
            onPress={() => setToggleSignUp(!toggleSignUp)}
          >
            {"No account? Sign Up"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "80%",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#cccccc",
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
