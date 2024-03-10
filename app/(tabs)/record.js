import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import { Video } from "expo-av";

export default function Page() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleRecordButton = async () => {
    if (!hasPermission) {
      alert("Camera permission is not granted");
      return;
    }

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

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
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
});
