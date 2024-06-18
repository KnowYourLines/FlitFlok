import React from "react";
import RNPickerSelect from "react-native-picker-select";

export default function PurposePicker({ purpose, setPurpose }) {
  return (
    <RNPickerSelect
      placeholder={{
        label: purpose || "No location purpose selected",
        value: purpose || "",
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
        { label: "No location purpose selected", value: "" },
      ].filter((item) => item.value != purpose)}
    />
  );
}
