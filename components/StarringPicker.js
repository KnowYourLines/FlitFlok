import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import RNPickerSelect from "react-native-picker-select";

export default function StarringPicker({ user, starring, setStarring }) {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const [buddies, setBuddies] = useState([]);

  const getBuddies = async () => {
    const token = await user.getIdToken(true);
    const response = await fetch(`${backendUrl}/buddies/`, {
      method: "GET",
      headers: new Headers({
        Authorization: token,
      }),
    });
    const responseJson = await response.json();
    if (response.status != 200) {
      Alert.alert(`${response.status} error: ${responseJson}`);
    } else {
      const buddies = responseJson.map((buddy) => ({
        label: buddy["display_name"],
        value: buddy["username"],
      }));
      setBuddies(buddies);
    }
  };

  useEffect(() => {
    (async () => {
      await getBuddies();
    })();
  }, []);

  return (
    <RNPickerSelect
      placeholder={{
        label: "No buddy selected",
        value: "",
      }}
      value={starring}
      onValueChange={(value) => setStarring(value)}
      useNativeAndroidPickerStyle={false}
      textInputProps={{
        style: { color: "white", fontSize: 16, fontWeight: "bold" },
      }}
      items={buddies}
    />
  );
}
