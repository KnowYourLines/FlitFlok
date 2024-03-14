import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import Button from "./Button.js";
import { Fontisto } from "@expo/vector-icons";
import { storage } from "../firebaseConfig.js";
import { ref, uploadBytes } from "firebase/storage";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";

const FindLocation = ({ setVideoApproved, videoUri, user }) => {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [addresses, setAddresses] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const router = useRouter();
  useEffect(() => {
    (async () => {
      if (status && !status.granted && status.canAskAgain) {
        await requestPermission();
      }
      if (status && status.granted) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setLocation(location);
        const locationAddresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const addresses = locationAddresses.map(function (locationAddress) {
          const address = [
            ...new Set([
              locationAddress.streetNumber,
              locationAddress.street,
              locationAddress.district,
              locationAddress.city,
              locationAddress.subregion,
              locationAddress.region,
              locationAddress.country,
              locationAddress.isoCountryCode,
              locationAddress.postalCode,
            ]),
          ]
            .filter((value) => value)
            .join(", ");
          return { name: locationAddress.name, address: address };
        });
        setAddresses(addresses);
      }
    })();
  }, [status]);

  const handleBackButton = () => {
    setVideoApproved(false);
  };

  const openAppSettings = () => {
    Linking.openURL("app-settings:");
  };

  const toggleItemSelection = (item) => {
    if (selectedAddress && selectedAddress.address === item.address) {
      setSelectedAddress(null);
    } else {
      setSelectedAddress(item);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => toggleItemSelection(item)}
    >
      <Text style={styles.itemTitle}>
        {selectedAddress && selectedAddress.address === item.address && (
          <Fontisto name="checkbox-active" size={28} color="black" />
        )}
        {selectedAddress && selectedAddress.address !== item.address && (
          <Fontisto name="checkbox-passive" size={28} color="black" />
        )}
        {!selectedAddress && (
          <Fontisto name="checkbox-passive" size={28} color="black" />
        )}{" "}
        {item.name}
      </Text>
      <Text style={styles.itemSubtitle}>{item.address}</Text>
    </TouchableOpacity>
  );

  if (!status) {
    return <View />;
  }

  if (!status.granted && !status.canAskAgain) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtitle}>
          Access to location is required to tag where videos were submitted from
        </Text>
        <TouchableOpacity
          onPress={openAppSettings}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsButtonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <View style={styles.messageContainer}>
          <Text
            style={styles.coords}
          >{`Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n`}</Text>
          <Text style={styles.text}>Select address (if any):</Text>
          <FlatList
            data={addresses}
            renderItem={renderItem}
            keyExtractor={(item) => item.address}
            extraData={selectedAddress}
          />
          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              <Button
                title="Back"
                color={"#2196F3"}
                onPress={handleBackButton}
              />
              <Button
                title={"Post"}
                onPress={async () => {
                  const UUID = Crypto.randomUUID();
                  const storageRef = ref(storage, UUID);
                  const video = await fetch(videoUri);
                  const file = await video.blob();
                  const metadata = {
                    contentType: "video/mp4",
                  };
                  uploadBytes(storageRef, file, metadata).then((snapshot) => {
                    user.getIdToken(true).then((token) => {
                      fetch(`${backendUrl}/video/`, {
                        method: "POST",
                        headers: new Headers({
                          Accept: "application/json",
                          Authorization: token,
                          "Content-Type": "application/json",
                        }),
                        body: JSON.stringify({
                          file_id: UUID,
                          location: {
                            type: "Point",
                            coordinates: [
                              -0.0333876462451904, 51.51291201050047,
                            ],
                          },
                          address: selectedAddress?.address,
                          name: selectedAddress?.name,
                        }),
                      })
                        .then((response) => {
                          if (response.status == 201) {
                            Alert.alert("Uploaded successfully");
                            router.replace("/");
                          } else {
                            response.json().then((responseData) => {
                              Alert.alert(
                                `${response.status} error: ${JSON.stringify(
                                  responseData
                                )}`
                              );
                            });
                          }
                        })
                        .catch((error) => {
                          Alert.alert("Error", error);
                        });
                    });
                  });
                }}
              />
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.subtitle}>Finding your location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    gap: "100%",
    marginTop: "50%",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    marginTop: "20%",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
  coords: {
    fontSize: 18,
    color: "#38434D",
    textAlign: "center",
  },
  text: {
    fontSize: 24,
    color: "#38434D",
    textAlign: "center",
    fontWeight: "bold",
  },
  settingsButton: {
    marginTop: 20,
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  settingsButtonText: {
    color: "white",
    fontSize: 16,
  },
  item: {
    padding: 10,
    marginBottom: "1%",
    borderRadius: "1%",
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  itemSubtitle: {
    fontSize: 18,
    color: "#38434D",
    textAlign: "center",
    marginBottom: "1%",
  },
});

export default FindLocation;
