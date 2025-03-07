import { StyleSheet, Dimensions, Platform } from "react-native";

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
  rightContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    marginRight: "1%",
    marginBottom: Platform.OS === "ios" ? "20%" : "5%",
    gap: 35,
  },
  bottomContainer: {
    width: Dimensions.get("window").width,
    position: "absolute",
    bottom: 0,
    marginBottom: Platform.OS === "ios" ? "10%" : "5%",
    flexDirection: "row",
    justifyContent: "left",
    alignItems: "flex-end",
    marginLeft: "1%",
  },
  bottomText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default styles;
