import React from "react";
import { Text, StyleSheet, Pressable } from "react-native";

export default function Button(props) {
  const { disabled, onPress, title = "Save", color = "red" } = props;
  return (
    <Pressable
      style={disabled ? styles(color).disabledButton : styles(color).button}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles(color).text}>{title}</Text>
    </Pressable>
  );
}

const styles = (color) =>
  StyleSheet.create({
    button: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: color,
      marginBottom: "5%",
    },
    disabledButton: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: "grey",
      marginBottom: "5%",
    },
    text: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "bold",
      letterSpacing: 0.25,
      color: "white",
    },
  });
