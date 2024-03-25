import { Video, ResizeMode } from "expo-av";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pressable, View } from "react-native";
import styles from "./styles";

/**
 * This component is responsible for displaying a post and play the
 * media associated with it.
 *
 * The ref is forwarded to this component so that the parent component
 * can manage the play status of the video.
 */
export const VideoPost = forwardRef(({ item }, parentRef) => {
  const [status, setStatus] = useState(null);
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
          shouldPlay={status?.isPlaying}
          isLooping
          source={{ uri: item.downloadUrl }}
          onPlaybackStatusUpdate={(status) => setStatus(status)}
        />
      </View>
    </Pressable>
  );
});

export default VideoPost;
