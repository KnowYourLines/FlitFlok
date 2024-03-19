import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useDispatch } from "react-redux";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebaseConfig.js";
import { agreeEula } from "../../redux/eula.js";
import EULA from "../../components/EULA.js";
import * as Location from "expo-location";

export default function Page() {
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  const dispatch = useDispatch();
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (status && !status.granted && status.canAskAgain) {
        requestPermission();
      }
      if (status && status.granted) {
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        }).then((location) => setLocation(location));
      }
    };
    getLocation();
  }, [status]);

  onAuthStateChanged(auth, (user) => {
    if (user) {
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
  return (
    <View style={styles.container}>
      <EULA />
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        {location && (
          <Text
            style={styles.subtitle}
          >{`Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n`}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
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
