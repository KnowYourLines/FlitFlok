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
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import { agreeEula } from "../../redux/eula.js";
import EULA from "../../components/EULA.js";
import * as Location from "expo-location";
import { storage } from "../../firebaseConfig.js";
import { ref, getDownloadURL } from "firebase/storage";
import VideoPost from "../../components/VideoPost";

export default function Page() {
  const eula = useSelector((state) => state.eula.agreed);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const screenHeight = Dimensions.get("window").height;
  const dispatch = useDispatch();
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const mediaRefs = useRef([]);
  const flatListRef = useRef(null);

  /**
   * Called any time a new post is shown when a user scrolls
   * the FlatList, when this happens we should start playing
   * the post that is viewable and stop all the others
   */
  const onViewableItemsChanged = useRef(({ changed }) => {
    changed.forEach((element) => {
      const cell = mediaRefs.current[element.key];
      if (cell) {
        if (element.isViewable) {
          cell.play();
        } else {
          cell.stop();
        }
      }
    });
  });
  /**
   * renders the item shown in the FlatList
   *
   * @param {Object} item object of the post
   * @param {Integer} index position of the post in the FlatList
   * @returns
   */
  const renderItem = ({ item, index }) => {
    return (
      <View style={{ height: screenHeight, backgroundColor: "black" }}>
        <VideoPost
          getLocation={getLocation}
          item={item}
          user={user}
          deleteVideoByIds={deleteVideoByIds}
          ref={(VideoPostRef) => (mediaRefs.current[item.id] = VideoPostRef)}
        />
      </View>
    );
  };

  const deleteVideoByIds = (ids) => {
    const filteredVideos = videos.filter(
      (video) => ids.indexOf(video.id) == -1
    );
    setVideos(filteredVideos);
  };

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
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: 0, animated: false });
        }
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
    Linking.openSettings();
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
          ref={flatListRef}
          data={videos}
          windowSize={5}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews
          viewabilityConfig={{
            itemVisiblePercentThreshold: 0,
          }}
          renderItem={renderItem}
          pagingEnabled
          keyExtractor={(item) => item.id}
          horizontal={false}
          snapToInterval={screenHeight}
          snapToAlignment={"center"}
          decelerationRate={"fast"}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged.current}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
