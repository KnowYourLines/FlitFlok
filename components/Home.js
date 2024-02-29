import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import { update } from "../userSlice";

export default function Home() {
  const user = useSelector((state) => state.user.saved);
  const dispatch = useDispatch();
  console.log(user);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      auth.currentUser
        .getIdToken(true)
        .then(function (idToken) {
          console.log(idToken);
          dispatch(update(1));
        })
        .catch(function (error) {});
    } else {
      signInAnonymously(auth);
    }
  });
  return (
    <View style={styles.container}>
      <Text>Hello, World! {user}</Text>
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
