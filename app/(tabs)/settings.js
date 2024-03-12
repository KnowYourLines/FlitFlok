import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { useRouter } from "expo-router";
import Button from "../../components/Button.js";
import { auth } from "../../firebaseConfig.js";
import SignIn from "../../components/SignIn.js";

export default function Page() {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const [user, setUser] = useState(null);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    }
  });
  return (
    <View style={styles.container}>
      {user && user.emailVerified && (
        <View style={styles.main}>
          <Text style={styles.title}>Hello</Text>
          <Text style={styles.subtitle}>{user.email}</Text>
          <Button
            title={"Delete Account"}
            onPress={() => {
              auth.signOut().then(() => {
                user.getIdToken(true).then((token) => {
                  fetch(`${backendUrl}/delete-account/`, {
                    method: "DELETE",
                    headers: new Headers({
                      Authorization: token,
                    }),
                  }).then((response) => {
                    if (response.status == 204) {
                      router.replace("/");
                    }
                  });
                });
              });
            }}
          />
        </View>
      )}
      {user && user.isAnonymous && (
        <View style={styles.main}>
          <Text style={styles.title}>Hello {`${user.isAnonymous}`}</Text>
          <Text style={styles.subtitle}>You are anonymous.</Text>
          <SignIn updateUser={setUser}></SignIn>
        </View>
      )}
      {user && user.email && !user.emailVerified && (
        <View style={styles.main}>
          <Text style={styles.title}>Hello</Text>
          <Text style={styles.subtitle}>
            A verification email was sent to {user.email}
          </Text>
          <Button
            title={"Resend verification email"}
            color="#2196F3"
            onPress={() => {
              sendEmailVerification(user);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
});
