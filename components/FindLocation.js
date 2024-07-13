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
  const [currentUpload, setCurrentUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("0.00%");
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
    if (currentUpload) {
      currentUpload.abort();
    }
  };

  const handleCancelButton = () => {
    currentUpload.abort();
    setCurrentUpload(null);
    setIsUploading(false);
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
      {location && !currentUpload && (
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
                title={"Post"}
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
                    const options = {
                      endpoint: `${backendUrl}/video-upload/`,
                      headers: {
                        Authorization: token,
                      },
                      metadata: {
                        ...(purpose ? { purpose: purpose } : {}),
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                      },
                      chunkSize: 5 * 1024 * 1024,
                      retryDelays: [0, 1000, 3000, 5000, 10000, 15000],
                      onError: function (error) {
                        setIsUploading(false);
                        Alert.alert(
                          "Please try again. Upload failed because: " + error
                        );
                      },
                      onProgress: function (bytesUploaded, bytesTotal) {
                        const percentage = (
                          (bytesUploaded / bytesTotal) *
                          100
                        ).toFixed(2);
                        setUploadProgress(percentage + "%");
                      },
                      onSuccess: function () {
                        setIsUploading(false);
                        Alert.alert(
                          "Uploaded successfully. Post will appear after processing."
                        );
                        resetCamera();
                      },
                    };
                    const upload = new tus.Upload(file, options);
                    upload.start();
                    setCurrentUpload(upload);
                  }
                }}
              />
            </View>
          </View>
        </View>
      )}
      {location && currentUpload && (
        <View>
          <View style={styles.bodyContainer}>
            <Text style={styles.text}>{`${uploadProgress} uploaded`}</Text>
          </View>
          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                color={"#2196F3"}
                onPress={handleCancelButton}
              />
              {isUploading ? (
                <Button
                  title={"Pause"}
                  onPress={async () => {
                    setIsUploading(false);
                    currentUpload.abort();
                  }}
                />
              ) : (
                <Button
                  title={"Resume"}
                  onPress={() => {
                    setIsUploading(true);
                    currentUpload
                      .findPreviousUploads()
                      .then(function (previousUploads) {
                        // Found previous uploads so we select the first one.
                        if (previousUploads.length) {
                          currentUpload.resumeFromPreviousUpload(
                            previousUploads[0]
                          );
                        }

                        // Start the upload
                        currentUpload.start();
                      });
                  }}
                />
              )}
            </View>
          </View>
        </View>
      )}
      {!location && (
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
