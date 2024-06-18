import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import { agreeEula } from "../../redux/eula.js";
import EULA from "../../components/EULA.js";
import * as Location from "expo-location";
import VideoPost from "../../components/VideoPost";
import PurposePicker from "../../components/PurposePicker.js";
import { setPurpose } from "../../redux/reel.js";

export default function Page() {
  const eula = useSelector((state) => state.eula.agreed);
  const purpose = useSelector((state) => state.reel.purpose);
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const screenHeight = Dimensions.get("window").height;
  const dispatch = useDispatch();
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [locationFullyDenied, setLocationFullyDenied] = useState(false);
  const [videos, setVideos] = useState([]);
  const mediaRefs = useRef([]);
  const flatListRef = useRef(null);

  const savePurpose = (value) => {
    dispatch(setPurpose(value));
  };

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
          purpose={purpose}
          savePurpose={savePurpose}
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
    (async () => {
      if (user && location) {
        const token = await user.getIdToken(true);
        let requestUrl = `${backendUrl}/video/?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`;
        if (purpose) {
          requestUrl += `&purpose=${encodeURIComponent(purpose)}`;
        }
        const response = await fetch(requestUrl, {
          method: "GET",
          headers: new Headers({
            Authorization: token,
          }),
        });
        const ResponseJson = await response.json();
        if (response.status != 200) {
          if (ResponseJson.current_video) {
            Alert.alert(
              `${response.status} error: ${ResponseJson.current_video[0]}`
            );
          }
        }
        setVideos(ResponseJson.features);
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: 0, animated: false });
        }
      }
    })();
  }, [user, location, purpose]);

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
    if (!locationFullyDenied) {
      setLocationFullyDenied(true);
      Alert.alert(
        "Access to location is required to show videos around you",
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
          Finding nearby videos is not enabled on this device
        </Text>
      </View>
    );
  }

  if (videos.length == 0) {
    return (
      <View style={styles.messageContainer}>
        <View style={styles.buttonContainer}>
          <View style={styles.topContainer}>
            <TouchableOpacity style={styles.button}>
              <PurposePicker purpose={purpose} setPurpose={savePurpose} />
            </TouchableOpacity>
          </View>
        </View>
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
          snapToAlignment={"top"}
          decelerationRate={"fast"}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged.current}
          onEndReachedThreshold={0.5}
          onEndReached={async () => {
            const lastVideo = videos[videos.length - 1];
            const token = await user.getIdToken(true);
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
              Alert.alert(`${response.status} error: ${ResponseJson}`);
            }
            setVideos(videos.concat(ResponseJson.features));
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
  topContainer: {
    position: "absolute",
    justifyContent: "top",
    alignItems: "center",
    top: "7.5%",
  },
  button: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
