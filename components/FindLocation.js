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
import { useRouter } from "expo-router";

const FindLocation = ({ setVideoApproved, videoUri, user }) => {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [addresses, setAddresses] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
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
          accuracy: Location.Accuracy.Balanced,
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
    Linking.openSettings();
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
    Alert.alert(
      "Access to location is required to tag where videos were recorded",
      "",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: openAppSettings,
        },
      ]
    );
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtitle}>
          Tagging where videos were recorded is not enabled on this device
        </Text>
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
                title={isUploading ? "Uploading..." : "Post"}
                disabled={isUploading}
                onPress={async () => {
                  setIsUploading(true);
                  const token = await user.getIdToken(true);
                  const response = await fetch(`${backendUrl}/video-upload/`, {
                    method: "GET",
                    headers: new Headers({
                      Authorization: token,
                    }),
                  });
                  const responseJson = await response.json();
                  if (response.status != 200) {
                    Alert.alert(
                      `${response.status} error: ${JSON.stringify(
                        responseJson
                      )}`
                    );
                  } else {
                    const video = await fetch(videoUri);
                    const file = await video.blob();
                    const uploadUrl = responseJson.properties.url;
                    const videoId = responseJson.properties.passthrough;

                    const response = await fetch(uploadUrl, {
                      method: "PUT",
                      body: file,
                      headers: { "content-type": file.type },
                    });
                    if (response.status != 200) {
                      Alert.alert(
                        `${response.status} error: ${JSON.stringify(
                          responseJson
                        )}`
                      );
                      setIsUploading(false);
                    } else {
                      const response = await fetch(
                        `${backendUrl}/video/${videoId}/`,
                        {
                          method: "PATCH",
                          headers: new Headers({
                            Accept: "application/json",
                            Authorization: token,
                            "Content-Type": "application/json",
                          }),
                          body: JSON.stringify({
                            location: {
                              type: "Point",
                              coordinates: [
                                location.coords.longitude,
                                location.coords.latitude,
                              ],
                            },
                            address: selectedAddress?.address,
                            place_name: selectedAddress?.name,
                          }),
                        }
                      );
                      if (response.status == 200) {
                        Alert.alert("Uploaded successfully");
                        router.replace("/");
                      } else {
                        const responseJson = await response.json();
                        Alert.alert(
                          `Upload failed! ${
                            response.status
                          } error: ${JSON.stringify(responseJson)}`
                        );
                        setIsUploading(false);
                      }
                    }
                  }
                  // const storageRef = ref(storage, UUID);
                  // const video = await fetch(videoUri);
                  // const file = await video.blob();
                  // const metadata = {
                  //   contentType: "video/mp4",
                  // };
                  // uploadBytesResumable(storageRef, file, metadata)
                  //   .then((snapshot) => {
                  //     user.getIdToken(true).then((token) => {
                  //       fetch(`${backendUrl}/video/`, {
                  //         method: "POST",
                  //         headers: new Headers({
                  //           Accept: "application/json",
                  //           Authorization: token,
                  //           "Content-Type": "application/json",
                  //         }),
                  //         body: JSON.stringify({
                  //           file_id: UUID,
                  //           location: {
                  //             type: "Point",
                  //             coordinates: [
                  //               location.coords.longitude,
                  //               location.coords.latitude,
                  //             ],
                  //           },
                  //           address: selectedAddress?.address,
                  //           name: selectedAddress?.name,
                  //         }),
                  //       })
                  //         .then((response) => {
                  //           if (response.status == 201) {
                  //             Alert.alert("Uploaded successfully");
                  //             router.replace("/");
                  //           } else {
                  //             response.json().then((responseData) => {
                  //               Alert.alert(
                  //                 `Upload failed! ${
                  //                   response.status
                  //                 } error: ${JSON.stringify(responseData)}`
                  //               );
                  //               setIsUploading(false);
                  //             });
                  //           }
                  //         })
                  //         .catch((error) => {
                  //           Alert.alert(`Upload failed! ${error}`);
                  //           setIsUploading(false);
                  //         });
                  //     });
                  //   })
                  //   .catch((error) => {
                  //     Alert.alert(`Upload failed! ${error}`);
                  //     setIsUploading(false);
                  //   });
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
    gap: 100,
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
  item: {
    padding: 10,
    marginBottom: "1%",
    borderRadius: 5,
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
