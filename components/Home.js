import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, Modal } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../firebaseConfig.js";
import { agreeEula } from "../redux/eula.js";

export default function Home() {
  const eula = useSelector((state) => state.eula.agreed);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const dispatch = useDispatch();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      user.getIdToken(true).then(async (token) => {
        const response = await fetch(`${backendUrl}/eula-agreed/`, {
          method: "GET",
          headers: new Headers({
            Authorization: token,
          }),
        });
        const ResponseJson = await response.json();
        dispatch(agreeEula(ResponseJson.agreed_to_eula));
      });
    } else {
      signInAnonymously(auth);
    }
  });
  return (
    <View style={styles.container}>
      <Modal animationType="slide" transparent={true} visible={!eula}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              You must agree to the End User License Agreement
            </Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                auth.currentUser.getIdToken(true).then(async (token) => {
                  const response = await fetch(`${backendUrl}/eula-agreed/`, {
                    method: "PATCH",
                    headers: new Headers({
                      Authorization: token,
                      "Content-Type": "application/json",
                    }),
                    body: JSON.stringify({
                      agreed_to_eula: true,
                    }),
                  });
                  const ResponseJson = await response.json();
                  dispatch(agreeEula(ResponseJson.agreed_to_eula));
                });
              }}
            >
              <Text style={styles.textStyle}>Agree</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Text>Hello, World!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "green",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
