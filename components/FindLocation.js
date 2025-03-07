import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as Location from "expo-location";
import * as tus from "tus-js-client";
import Button from "./Button.js";
import CurrencyPicker from "./CurrencyPicker.js";
import StarringPicker from "./StarringPicker.js";
import { setCode } from "../redux/currency.js";
import { setBuddy } from "../redux/starring.js";
import { useNetInfo } from "@react-native-community/netinfo";

const FindLocation = ({ setVideoApproved, resetCamera, videoUri, user }) => {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState(null);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("0.00%");
  const [amountSpent, setAmountSpent] = useState("");
  const currency = useSelector((state) => state.currency.code);
  const starring = useSelector((state) => state.starring.buddy);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const netInfo = useNetInfo();
  const dispatch = useDispatch();

  const saveStarring = (value) => {
    dispatch(setBuddy(value));
  };

  const saveCurrency = (value) => {
    dispatch(setCode(value));
  };

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
            <Text style={styles.text}>Buddy:</Text>
            <TouchableOpacity style={styles.button}>
              <StarringPicker
                starring={starring}
                setStarring={saveStarring}
                user={user}
              />
            </TouchableOpacity>
            <Text style={styles.text}>Currency:</Text>
            <TouchableOpacity style={styles.button}>
              <CurrencyPicker currency={currency} setCurrency={saveCurrency} />
            </TouchableOpacity>
            <Text style={styles.text}>Amount Spent:</Text>
            <TextInput
              style={styles.input}
              onChangeText={setAmountSpent}
              value={amountSpent}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
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
                  const currencyRegEx = /^\d+\.{0,1}\d{0,2}$/;
                  if (
                    !netInfo.isInternetReachable &&
                    netInfo.isInternetReachable !== null
                  ) {
                    Alert.alert(`No internet connection!`);
                  } else if (!starring) {
                    Alert.alert(`No buddy specified!`);
                  } else if (!currency || !amountSpent) {
                    Alert.alert(`Currency and amount required!`);
                  } else if (!currencyRegEx.test(amountSpent)) {
                    Alert.alert(
                      `Invalid amount entered. Only numbers followed by . allowed!`
                    );
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
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        currency: currency,
                        money_spent: amountSpent,
                        starring_firebase_uid: starring,
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
  input: {
    width: 200,
    height: 50,
    padding: 10,
    fontSize: 18,
    color: "#333",
    backgroundColor: "#fff",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    textAlign: "center",
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
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
