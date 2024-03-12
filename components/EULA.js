import React from "react";
import { Modal, StyleSheet, Text, Pressable, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { auth } from "../firebaseConfig.js";
import { agreeEula } from "../redux/eula.js";
import * as Linking from "expo-linking";

export default function EULA() {
  const eula = useSelector((state) => state.eula.agreed);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const dispatch = useDispatch();
  return (
    <Modal animationType="slide" transparent={true} visible={!eula}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            To continue, you must agree to the{" "}
            <Text
              style={{ color: "blue" }}
              onPress={() => Linking.openURL("https://flitflok.com/eula.html")}
            >
              End User License Agreement
            </Text>
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
  );
}

const styles = StyleSheet.create({
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
