import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  TextInput,
} from "react-native";
import { auth } from "../firebaseConfig.js";

export default function SendBuddyRequest({
  showModal,
  setShowModal,
}) {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [username, setUsername] = useState("");
  return (
    <Modal animationType="slide" transparent={true} visible={showModal}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Enter your buddy's username
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Buddy Username"
            placeholderTextColor="grey"
            maxLength={28}
            value={username}
            onChangeText={setUsername}
          />
          <View style={{ flexDirection: "row", margin: 20 }}>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                auth.currentUser.getIdToken(true).then(async (token) => {
                  const response = await fetch(`${backendUrl}/buddy-request/`, {
                    method: "POST",
                    headers: new Headers({
                      Authorization: token,
                      "Content-Type": "application/json",
                    }),
                    body: JSON.stringify({
                      display_name: username,
                    }),
                  });
                  const responseJson = await response.json();
                  if (response.status != 200) {
                    Alert.alert(
                      `${response.status} error: ${responseJson.display_name[0]}`
                    );
                  } else {
                    setShowModal(false);
                    setUsername("");
                  }
                });
              }}
            >
              <Text style={styles.textStyle}>Send</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setShowModal(false);
                setUsername("");
              }}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
          </View>
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
    marginHorizontal: 20,
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
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "black",
  },
});
