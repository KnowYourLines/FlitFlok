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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        item.address === selectedAddress?.address && styles.selectedAddress,
      ]}
      onPress={() => setSelectedAddress(item)}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.address}</Text>
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
        <FlatList
          data={addresses}
          renderItem={renderItem}
          keyExtractor={(item) => item.address}
          extraData={selectedAddress}
        />
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
  backButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  item: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9c2ff',
    borderRadius: 5,
  },
  itemText: {
    fontSize: 18,
  },
  selectedItem: {
    backgroundColor: '#64b5f6',
  },
  selectedText: {
    marginTop: 20,
    fontSize: 20,
  },
});

export default FindLocation;
