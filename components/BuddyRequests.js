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

export default function BuddyRequests({ showModal, setShowModal }) {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [buddyRequests, setBuddyRequests] = useState([]);

  const getBuddyRequests = async () => {
    const token = await auth.currentUser.getIdToken(true);
    const response = await fetch(`${backendUrl}/received-buddy-requests/`, {
      method: "GET",
      headers: new Headers({
        Authorization: token,
      }),
    });
    const responseJson = await response.json();
    if (response.status != 200) {
      Alert.alert(`${response.status} error: ${responseJson}`);
    } else {
      setBuddyRequests(responseJson);
    }
  };

  useEffect(() => {
    (async () => {
      await getBuddyRequests();
    })();
  }, [showModal]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.buddy}>
        <Text style={styles.modalText}>{item.sender_display_name}</Text>
        <View style={{ flexDirection: "row", margin: 20 }}>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              auth.currentUser.getIdToken(true).then(async (token) => {
                const response = await fetch(
                  `${backendUrl}/buddy-request/${item.id}/accept/`,
                  {
                    method: "PATCH",
                    headers: new Headers({
                      Authorization: token,
                      "Content-Type": "application/json",
                    }),
                  }
                );
                if (response.status != 202) {
                  const responseJson = await response.json();
                  Alert.alert(`${response.status} error: ${responseJson[0]}`);
                } else {
                  await getBuddyRequests();
                }
              });
            }}
          >
            <Text style={styles.textStyle}>Accept</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              auth.currentUser.getIdToken(true).then(async (token) => {
                const response = await fetch(
                  `${backendUrl}/buddy-request/${item.id}/decline/`,
                  {
                    method: "DELETE",
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
                  await getBuddyRequests();
                }
              });
            }}
          >
            <Text style={styles.textStyle}>Decline</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              auth.currentUser.getIdToken(true).then(async (token) => {
                const response = await fetch(
                  `${backendUrl}/buddy-request/${item.id}/block/`,
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
                  await getBuddyRequests();
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
            {buddyRequests.length == 0 ? (
              <Text style={styles.modalText}>No Buddy Requests</Text>
            ) : (
              <FlatList
                data={buddyRequests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
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
