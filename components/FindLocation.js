import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import * as tus from "tus-js-client";
import Button from "./Button.js";
import PurposePicker from "./PurposePicker.js";
import { useNetInfo } from "@react-native-community/netinfo";

const FindLocation = ({ setVideoApproved, resetCamera, videoUri, user }) => {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState(null);
  const [purpose, setPurpose] = useState("");
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const netInfo = useNetInfo();

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
      }
    })();
  }, [status]);

  const handleBackButton = () => {
    setVideoApproved(false);
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

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
        <View>
          <View style={styles.bodyContainer}>
            <Text
              style={styles.coords}
            >{`Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n`}</Text>
            <Text style={styles.text}>Purpose (if any):</Text>
            <TouchableOpacity style={styles.button}>
              <PurposePicker purpose={purpose} setPurpose={setPurpose} />
            </TouchableOpacity>
          </View>
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
                  if (
                    !netInfo.isInternetReachable &&
                    netInfo.isInternetReachable !== null
                  ) {
                    Alert.alert(`No internet connection!`);
                  } else {
                    setIsUploading(true);
                    const token = await user.getIdToken(true);
                    const video = await fetch(videoUri);
                    const file = await video.blob();
                    var options = {
                      endpoint: `${backendUrl}/video-upload/`,
                      headers: {
                        Authorization: token,
                      },
                      chunkSize: 5 * 1024 * 1024, // Required a minimum chunk size of 5MB, here we use 50MB.
                      retryDelays: [0, 3000, 5000, 10000, 20000], // Indicates to tus-js-client the delays after which it will retry if the upload fails
                      onError: function (error) {
                        console.log("Failed because: " + error);
                      },
                      onProgress: function (bytesUploaded, bytesTotal) {
                        var percentage = (
                          (bytesUploaded / bytesTotal) *
                          100
                        ).toFixed(2);
                        console.log(
                          bytesUploaded,
                          bytesTotal,
                          percentage + "%"
                        );
                      },
                      onSuccess: function () {
                        console.log("Upload finished");
                        setIsUploading(false);
                      },
                      onAfterResponse: function (req, res) {
                        var mediaIdHeader = res.getHeader("stream-media-id");
                        console.log(mediaIdHeader);
                      },
                    };

                    var upload = new tus.Upload(file, options);
                    upload.start();
                  }
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
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    gap: 100,
    marginTop: "85%",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bodyContainer: {
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
