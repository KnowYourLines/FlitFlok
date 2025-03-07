import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Camera, VideoQuality } from "expo-camera/legacy";
import { Video } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import BuddiesRequired from "../../components/BuddiesRequired.js";
import UnverifiedUser from "../../components/UnverifiedUser.js";
import FindLocation from "../../components/FindLocation.js";

export default function Page() {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [camStatus, requestCamPermission] = Camera.useCameraPermissions();
  const [micStatus, requestMicPermission] = Camera.useMicrophonePermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [showRecord, setShowRecord] = useState(false);
  const [videoApproved, setVideoApproved] = useState(false);
  const [user, setUser] = useState(null);
  const [recordingFullyDenied, setRecordingFullyDenied] = useState(false);
  const [buddies, setBuddies] = useState(["placeholder"]);
  const videoRef = useRef(null);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    }
  });

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
  }, []);

  useEffect(() => {
    (async () => {
      if (camStatus && !camStatus.granted && camStatus.canAskAgain) {
        await requestCamPermission();
      }
      if (micStatus && !micStatus.granted && micStatus.canAskAgain) {
        await requestMicPermission();
      }
    })();
  }, [camStatus, micStatus]);

  const handleRecordButton = () => {
    if (cameraRef) {
      if (!isRecording) {
        setIsRecording(true);
        cameraRef
          .recordAsync({
            maxDuration: 30,
            quality: VideoQuality["720p"],
          })
          .then((data) => {
            setVideoUri(data.uri);
            setIsRecording(false);
            setShowRecord(false);
            setShowCamera(false); // Switch to video preview after recording
          });
      } else {
        cameraRef.stopRecording();
      }
    }
  };

  const handleDeleteButton = () => {
    setVideoApproved(false);
    setVideoUri(null);
    setShowCamera(true); // Switch back to camera view after deleting video
  };

  const handleCheckmarkButton = () => {
    setVideoApproved(true);
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  if (!camStatus || !micStatus || !user) {
    return <View />;
  }

  if (user && !user.emailVerified) {
    return <UnverifiedUser></UnverifiedUser>;
  }

  if (buddies.length == 0) {
    return <BuddiesRequired></BuddiesRequired>;
  }

  if (
    (!camStatus.granted && !camStatus.canAskAgain) ||
    (!micStatus.granted && !micStatus.canAskAgain)
  ) {
    if (!recordingFullyDenied) {
      setRecordingFullyDenied(true);
      Alert.alert(
        "Access to camera and microphone is required to record video",
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
    }

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtitle}>
          Video recording is not enabled on this device
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showCamera && camStatus && camStatus.granted ? (
        <Camera
          onCameraReady={() => {
            setShowRecord(true);
          }}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={(ref) => setCameraRef(ref)}
        >
          {showRecord && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleRecordButton}
              >
                {isRecording ? (
                  <FontAwesome name="stop-circle" size={42} color="white" />
                ) : (
                  <MaterialCommunityIcons
                    name="record-rec"
                    size={42}
                    color={"white"}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </Camera>
      ) : videoApproved ? (
        <FindLocation
          setVideoApproved={setVideoApproved}
          resetCamera={handleDeleteButton}
          videoUri={videoUri}
          user={user}
        ></FindLocation>
      ) : videoUri ? (
        <View style={styles.videoPreviewContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.videoPreview}
            useNativeControls
            resizeMode="contain"
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                videoRef.current.stopAsync();
              }
            }}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.checkmarkButton}
              onPress={handleCheckmarkButton}
            >
              <Entypo name="location" size={42} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteButton}
            >
              <MaterialCommunityIcons
                name="delete-forever"
                size={42}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.container}></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
    gap: 100,
  },
  recordButton: {
    alignSelf: "flex-end",
    margin: 20,
    backgroundColor: "red",
    borderRadius: 50,
    padding: 20,
  },
  videoPreviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPreview: {
    width: "100%",
    height: "80%", // Adjust the height here to make the video preview bigger
    marginTop: "15%",
  },
  checkmarkButton: {
    marginTop: "5%",
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginBottom: "5%",
  },
  deleteButton: {
    marginTop: "5%",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginBottom: "5%",
  },
  deleteText: {
    color: "white",
    fontSize: 16,
  },
});
