import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import { agreeEula } from "../redux/eulaSlice.js";

export default function Home() {
  const eula = useSelector((state) => state.eula.agreed);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const dispatch = useDispatch();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // dispatch(agreeEula(true));
      user.getIdToken(true).then(async (token) => {
        let response = await fetch(`${backendUrl}/eula-agreed/`, {
          method: "GET",
          headers: new Headers({
            Authorization: token,
          }),
        });
        response = await response.json();
        console.log(response);
      });
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
