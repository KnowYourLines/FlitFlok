import React, { useState } from "react";
import RNPickerSelect from "react-native-picker-select";

export default function PurposePicker({}) {
  const [purpose, setPurpose] = useState("");
  return (
    <RNPickerSelect
      placeholder={{
        label: "Select Location Type",
        value: null,
      }}
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
