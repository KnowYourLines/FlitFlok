import { Video, ResizeMode } from "expo-av";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pressable, View, TouchableOpacity, Text, Alert } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import styles from "./styles";
import moment from "moment";

/**
 * This component is responsible for displaying a post and play the
 * media associated with it.
 *
 * The ref is forwarded to this component so that the parent component
 * can manage the play status of the video.
 */
export const VideoPost = forwardRef(({ item, getLocation }, parentRef) => {
  const [status, setStatus] = useState(null);
  const [timestamp, setTimestamp] = useState(
    moment.unix(item.properties.posted_at).fromNow()
  );
  const ref = useRef(null);
  useImperativeHandle(parentRef, () => ({
    play,
    unload,
    stop,
  }));

  useEffect(() => {
    return () => unload();
  }, []);

  /**
   * Plays the video in the component if the ref
   * of the video is not null.
   *
   * @returns {void}
   */
  const play = async () => {
    if (ref.current == null) {
      return;
    }

    // if video is already playing return
    const status = await ref.current.getStatusAsync();
    if (status?.isPlaying) {
      return;
    }
    try {
      await ref.current.playAsync();
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Stops the video in the component if the ref
   * of the video is not null.
   *
   * @returns {void}
   */
  const stop = async () => {
    if (ref.current == null) {
      return;
    }

    // if video is already stopped return
    const status = await ref.current.getStatusAsync();
    if (!status?.isPlaying) {
      return;
    }
    try {
      await ref.current.stopAsync();
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * Unloads the video in the component if the ref
   * of the video is not null.
   *
   * This will make sure unnecessary video instances are
   * not in memory at all times
   *
   * @returns {void}
   */
  const unload = async () => {
    if (ref.current == null) {
      return;
    }

    // if video is already stopped return
    try {
      await ref.current.unloadAsync();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Pressable
      onPress={() =>
        status.isPlaying ? ref.current?.pauseAsync() : ref.current?.playAsync()
      }
    >
      <View style={styles.videoContainer}>
        <Video
          ref={ref}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping
          source={{ uri: item.downloadUrl }}
          onPlaybackStatusUpdate={(status) => setStatus(status)}
        />
        {status && !status.isPlaying && status.isLoaded && (
          <View style={styles.buttonContainer}>
            <View style={styles.topContainer}>
              <TouchableOpacity onPress={getLocation} style={styles.button}>
                <MaterialIcons name="my-location" size={42} color="white" />
              </TouchableOpacity>
            </View>
            <AntDesign name="playcircleo" size={120} color="white" />
          </View>
        )}
        <View style={styles.rightContainer}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Hide content?",
                "You will never see this post again",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  { text: "OK", onPress: () => console.log("OK Pressed") },
                ]
              );
            }}
          >
            <MaterialIcons name="hide-image" size={42} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Report inappropriate content?",
                "You will never see this post again",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  { text: "OK", onPress: () => console.log("OK Pressed") },
                ]
              );
            }}
          >
            <MaterialIcons name="report" size={42} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Block content from this user?",
                "You will never see this post again",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  { text: "OK", onPress: () => console.log("OK Pressed") },
                ]
              );
            }}
          >
            <MaterialIcons name="block" size={42} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomContainer}>
          <View>
            <Text
              style={styles.bottomText}
              numberOfLines={1}
            >{`${item.properties.distance} away`}</Text>
            <Text style={styles.bottomText} numberOfLines={1}>
              {timestamp === "in a few seconds" ? "just now" : timestamp}
            </Text>
          </View>
          <TouchableOpacity>
            <MaterialIcons
              name="directions"
              size={42}
              color="white"
              onPress={() => {
                const destination =
                  item.properties.address ||
                  item.properties.place_name ||
                  `${item.geometry.coordinates[1]}, ${item.geometry.coordinates[0]}`;
                console.log(destination);
                const url = encodeURI(
                  `https://www.google.com/maps/dir/?api=1&destination=${destination}`
                );
                Linking.openURL(url);
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
});

export default VideoPost;
