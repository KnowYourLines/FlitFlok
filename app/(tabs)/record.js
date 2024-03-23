import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  } from "react-native";
import { Camera, VideoQuality } from "expo-camera";
import { Video } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import UnverifiedUser from "../../components/UnverifiedUser.js";
import FindLocation from "../../components/FindLocation.js";

export default function Page() {
  const [camStatus, requestCamPermission] = Camera.useCameraPermissions();
  const [micStatus, requestMicPermission] = Camera.useMicrophonePermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [showRecord, setShowRecord] = useState(false);
  const [videoApproved, setVideoApproved] = useState(false);
  const [user, setUser] = useState(null);
  const videoRef = useRef(null);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    }
  });

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
            quality: VideoQuality["1080p"],
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
    Linking.openURL("app-settings:");
  };

  if (!camStatus || !micStatus || !user) {
    return <View />;
  }

  if (user && !user.emailVerified) {
    return <UnverifiedUser></UnverifiedUser>;
  }

  if (
    (!camStatus.granted && !camStatus.canAskAgain) ||
    (!micStatus.granted && !micStatus.canAskAgain)
  ) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtitle}>
          Access to camera and microphone is required to record video
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
      {showCamera ? (
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
          videoUri={videoUri}
          user={user}
        ></FindLocation>
      ) : (
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
});
