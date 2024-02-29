import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "./firebaseConfig.js";

export default function App() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      console.log(uid);
    } else {
      signInAnonymously(auth);
    }
  });

  return (
    <View style={styles.container}>
      <Text>Hello, World!</Text>
      <StatusBar style="auto" />
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
});
