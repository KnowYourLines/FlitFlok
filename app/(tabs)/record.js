import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Camera } from "expo-camera";
import { Video } from "expo-av";

export default function Page() {
  const [camStatus, requestCamPermission] = Camera.useCameraPermissions();
  const [micStatus, requestMicPermission] = Camera.useMicrophonePermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const videoRef = useRef(null);

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

  const handleRecordButton = async () => {
    if (cameraRef) {
      if (!isRecording) {
        setIsRecording(true);
        const videoRecordPromise = cameraRef.recordAsync();
        if (videoRecordPromise) {
          const data = await videoRecordPromise;
          setVideoUri(data.uri);
          setIsRecording(false);
          setShowCamera(false); // Switch to video preview after recording
        }
      } else {
        cameraRef.stopRecording();
        setIsRecording(false);
      }
    }
  };

  const handleDeleteButton = () => {
    setVideoUri(null);
    setShowCamera(true); // Switch back to camera view after deleting video
  };

  const openAppSettings = () => {
    Linking.openURL("app-settings:");
  };

  if (!camStatus || !micStatus) {
    return <View />;
  }

  if (
    (!camStatus.granted && !camStatus.canAskAgain) ||
    (!micStatus.granted && !micStatus.canAskAgain)
  ) {
    return (
      <View style={styles.messageContainer}>
        <Text>Access to camera and microphone is required to record video</Text>
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
          style={styles.camera}
          type={Camera.Constants.Type.back}
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleRecordButton}
            >
              <Text style={styles.recordText}>
                {isRecording ? "Stop" : "Record"}
              </Text>
            </TouchableOpacity>
          </View>
        </Camera>
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
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteButton}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
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
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
  },
  recordButton: {
    alignSelf: "flex-end",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 20,
  },
  recordText: {
    fontSize: 20,
  },
  videoPreviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPreview: {
    width: "100%",
    height: "80%", // Adjust the height here to make the video preview bigger
    marginTop: 20,
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
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
