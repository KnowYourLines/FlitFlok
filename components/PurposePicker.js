import React from "react";
import RNPickerSelect from "react-native-picker-select";

export default function PurposePicker({ purpose, setPurpose }) {
  return (
    <RNPickerSelect
      placeholder={{ label: purpose || "Select Location Type", value: purpose }}
      selectedValue={purpose}
      onValueChange={(value) => setPurpose(value)}
      useNativeAndroidPickerStyle={false}
      textInputProps={{
        style: { color: "white", fontSize: 16, fontWeight: "bold" },
      }}
      items={[
        { label: "Food & Drink", value: "Food & Drink" },
        {
          label: "Recreation & Entertainment",
          value: "Recreation & Entertainment",
        },
        { label: "Landmarks & Attractions", value: "Landmarks & Attractions" },
        { label: "Shopping", value: "Shopping" },
        { label: "Facilities & Services", value: "Facilities & Services" },
      ]}
    />
  );
}
