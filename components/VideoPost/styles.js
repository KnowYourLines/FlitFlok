import { StyleSheet, Dimensions } from "react-native";

const styles = StyleSheet.create({
  videoContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
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
});
export default styles;
