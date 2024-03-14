import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import Button from "./Button.js";
import { Fontisto } from "@expo/vector-icons";

const FindLocation = ({ setVideoApproved }) => {
  const [status, requestPermission] = Location.useForegroundPermissions();
  const [addresses, setAddresses] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    (async () => {
      if (status && !status.granted && status.canAskAgain) {
        await requestPermission();
      }
      if (status && status.granted) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setLocation(location);
        const locationAddresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const addresses = locationAddresses.map(function (locationAddress) {
          const address = [
            ...new Set([
              locationAddress.streetNumber,
              locationAddress.street,
              locationAddress.district,
              locationAddress.city,
              locationAddress.subregion,
              locationAddress.region,
              locationAddress.country,
              locationAddress.isoCountryCode,
              locationAddress.postalCode,
            ]),
          ]
            .filter((value) => value)
            .join(", ");
          return { name: locationAddress.name, address: address };
        });
        setAddresses(addresses);
      }
    })();
  }, [status]);

  const handleBackButton = () => {
    setVideoApproved(false);
  };

  const openAppSettings = () => {
    Linking.openURL("app-settings:");
  };

  const toggleItemSelection = (item) => {
    if (selectedAddress && selectedAddress.address === item.address) {
      setSelectedAddress(null);
    } else {
      setSelectedAddress(item);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => toggleItemSelection(item)}
    >
      <Text style={styles.itemTitle}>
        {selectedAddress && selectedAddress.address === item.address && (
          <Fontisto name="checkbox-active" size={28} color="black" />
        )}
        {selectedAddress && selectedAddress.address !== item.address && (
          <Fontisto name="checkbox-passive" size={28} color="black" />
        )}
        {!selectedAddress && (
          <Fontisto name="checkbox-passive" size={28} color="black" />
        )}{" "}
        {item.name}
      </Text>
      <Text style={styles.itemSubtitle}>{item.address}</Text>
    </TouchableOpacity>
  );

  if (!status) {
    return <View />;
  }

  if (!status.granted && !status.canAskAgain) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.subtitle}>
          Access to location is required to tag where videos were submitted from
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
      <Button title="Back" color={"#2196F3"} onPress={handleBackButton} />
      {location ? (
        <View>
          <Text
            style={styles.coords}
          >{`Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\n`}</Text>
          <Text style={styles.text}>
            Select the address (if any) of your post:
          </Text>
          <FlatList
            data={addresses}
            renderItem={renderItem}
            keyExtractor={(item) => item.address}
            extraData={selectedAddress}
          />
        </View>
      ) : (
        <Text style={styles.subtitle}>Finding your location...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    marginTop: "20%",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
    textAlign: "center",
    marginBottom: 20,
  },
  coords: {
    fontSize: 18,
    color: "#38434D",
    textAlign: "center",
  },
  text: {
    fontSize: 24,
    color: "#38434D",
    textAlign: "center",
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
  item: {
    padding: 10,
    marginBottom: "1%",
    borderRadius: "1%",
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
  },
  itemSubtitle: {
    fontSize: 18,
    color: "#38434D",
    textAlign: "left",
    marginBottom: "1%",
  },
});

export default FindLocation;
