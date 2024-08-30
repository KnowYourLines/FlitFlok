import React, { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  FlatList,
} from "react-native";
import { auth } from "../firebaseConfig.js";

export default function Buddies({ showModal, setShowModal }) {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [buddies, setBuddies] = useState([]);

  const getBuddies = async () => {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetch(`${backendUrl}/buddies/`, {
      method: "GET",
      headers: new Headers({
        Authorization: token,
      }),
    });
    const responseJson = await response.json();
    if (response.status != 200) {
      Alert.alert(`${response.status} error: ${responseJson}`);
    } else {
      setBuddies(responseJson);
    }
  };

  useEffect(() => {
    (async () => {
      await getBuddies();
    })();
  }, [showModal]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.buddy}>
        <Text style={styles.modalText}>
          {item.display_name || item.username}
        </Text>
        <View style={{ flexDirection: "row", margin: 20 }}>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              auth.currentUser.getIdToken(true).then(async (token) => {
                const response = await fetch(
                  `${backendUrl}/buddies/${item.username}/remove/`,
                  {
                    method: "PATCH",
                    headers: new Headers({
                      Authorization: token,
                      "Content-Type": "application/json",
                    }),
                  }
                );
                if (response.status != 204) {
                  const responseJson = await response.json();
                  Alert.alert(`${response.status} error: ${responseJson[0]}`);
                } else {
                  await getBuddies();
                }
              });
            }}
          >
            <Text style={styles.textStyle}>Remove</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              auth.currentUser.getIdToken(true).then(async (token) => {
                const response = await fetch(
                  `${backendUrl}/buddies/${item.username}/block/`,
                  {
                    method: "PATCH",
                    headers: new Headers({
                      Authorization: token,
                      "Content-Type": "application/json",
                    }),
                  }
                );
                if (response.status != 204) {
                  const responseJson = await response.json();
                  Alert.alert(`${response.status} error: ${responseJson[0]}`);
                } else {
                  await getBuddies();
                }
              });
            }}
          >
            <Text style={styles.textStyle}>Block</Text>
          </Pressable>
        </View>
      </View>
    );
  };
  return (
    <Modal animationType="slide" transparent={true} visible={showModal}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View>
            {buddies.length == 0 ? (
              <Text style={styles.modalText}>No Buddies</Text>
            ) : (
              <FlatList
                data={buddies}
                renderItem={renderItem}
                keyExtractor={(item) => item.username}
              />
            )}
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setShowModal(false);
              }}
            >
              <Text style={styles.textStyle}>Close</Text>
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
  buddy: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
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
});
