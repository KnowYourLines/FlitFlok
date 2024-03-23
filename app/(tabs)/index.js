import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Pressable,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import { agreeEula } from "../../redux/eula.js";
import EULA from "../../components/EULA.js";
import * as Location from "expo-location";
import { Video, ResizeMode } from "expo-av";
import { storage } from "../../firebaseConfig.js";
import { ref, getDownloadURL } from "firebase/storage";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

export default function Page() {
  const eula = useSelector((state) => state.eula.agreed);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const screenHeight = Dimensions.get("window").height;
  const dispatch = useDispatch();
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentViewableItemIndex(viewableItems[0].index ?? 0);
    }
  };
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const getLocation = () => {
    if (status && !status.granted && status.canAskAgain) {
      requestPermission();
    }
    if (status && status.granted) {
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).then((location) => setLocation(location));
    }
  };

  useEffect(() => {
    getLocation();
  }, [status]);

  useEffect(() => {
    if (user && location) {
      user.getIdToken(true).then(async (token) => {
        const response = await fetch(
          `${backendUrl}/video/?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`,
          {
            method: "GET",
            headers: new Headers({
              Authorization: token,
            }),
          }
        );
        const ResponseJson = await response.json();
        if (response.status != 200) {
          Alert.alert(
            `${response.status} error: ${JSON.stringify(ResponseJson)}`
          );
        }
        const videos = await Promise.all(
          ResponseJson.features.map(async (video) => {
            const downloadUrl = await getDownloadURL(
              ref(storage, video.properties.file_id)
            );
            return { ...video, downloadUrl: downloadUrl };
          })
        );
        setVideos(videos);
      });
    }
  }, [user, location]);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
      user.getIdToken(true).then(async (token) => {
        const response = await fetch(`${backendUrl}/eula-agreed/`, {
          method: "GET",
          headers: new Headers({
            Authorization: token,
          }),
        });
        const ResponseJson = await response.json();
        dispatch(agreeEula(ResponseJson.agreed_to_eula));
      });
    } else {
      signInAnonymously(auth).catch((error) => {
        Alert.alert("Error", error.message);
      });
    }
  });
  const openAppSettings = () => {
    Linking.openURL("app-settings:");
  };
  if (!status) {
    return <View />;
  }

  if (!status.granted && !status.canAskAgain) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtitle}>
          Access to location is required to show videos around you
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

  if (videos.length == 0) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtitle}>Finding videos posted around you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EULA />
      {eula && videos && (
        <FlatList
          data={videos}
          renderItem={({ item, index }) => (
            <Item
              item={item}
              shouldPlay={index === currentViewableItemIndex}
              getLocation={getLocation}
            />
          )}
          keyExtractor={(item) => item.id}
          pagingEnabled
          horizontal={false}
          snapToInterval={screenHeight}
          snapToAlignment={"center"}
          decelerationRate={"fast"}
          showsVerticalScrollIndicator={false}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            const lastVideo = videos[videos.length - 1];
            user.getIdToken(true).then(async (token) => {
              const response = await fetch(
                `${backendUrl}/video/?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current_video=${lastVideo.id}`,
                {
                  method: "GET",
                  headers: new Headers({
                    Authorization: token,
                  }),
                }
              );
              const ResponseJson = await response.json();
              if (response.status != 200) {
                Alert.alert(
                  `${response.status} error: ${JSON.stringify(ResponseJson)}`
                );
              }
              const newVideos = await Promise.all(
                ResponseJson.features.map(async (video) => {
                  const downloadUrl = await getDownloadURL(
                    ref(storage, video.properties.file_id)
                  );
                  return { ...video, downloadUrl: downloadUrl };
                })
              );
              setVideos(videos.concat(newVideos));
            });
          }}
        />
      )}
    </View>
  );
}

const Item = ({ item, shouldPlay, getLocation }) => {
  const video = useRef(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!video.current) return;

    if (shouldPlay) {
      video.current.playAsync();
    } else {
      video.current.pauseAsync();
      video.current.setPositionAsync(0);
    }
  }, [shouldPlay]);

  return (
    <Pressable
      onPress={() =>
        status.isPlaying
          ? video.current?.pauseAsync()
          : video.current?.playAsync()
      }
    >
      <View style={styles.videoContainer}>
        <Video
          ref={video}
          source={{ uri: item.downloadUrl }}
          style={styles.video}
          isLooping
          resizeMode={ResizeMode.COVER}
          useNativeControls={false}
          onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        />

        {status && !status.isPlaying && (
          <View style={styles.buttonContainer}>
            <View style={styles.topContainer}>
              <TouchableOpacity
                onPress={() => getLocation()}
                style={styles.button}
              >
                <MaterialIcons name="my-location" size={42} color="white" />
              </TouchableOpacity>
            </View>
            <AntDesign name="playcircleo" size={120} color="white" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  topContainer: {
    position: "absolute",
    justifyContent: "top",
    marginTop: "185%",
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  videoContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
