import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";
import Button from "../../components/Button.js";
import { auth } from "../../firebaseConfig.js";

export default function Page() {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const router = useRouter();
  const [authToken, setAuthToken] = useState(null);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      user.getIdToken(true).then((token) => {
        setAuthToken(token);
      });
    }
  });
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello</Text>
        <Text style={styles.subtitle}>You are anonymous.</Text>
        <Button
          title={"Delete Account"}
          onPress={() => {
            auth.signOut().then(() => {
              fetch(`${backendUrl}/delete-account/`, {
                method: "DELETE",
                headers: new Headers({
                  Authorization: authToken,
                }),
              }).then((response) => {
                if (response.status == 204) {
                  router.replace("/");
                }
              });
            });
          }}
        />
      </View>
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
