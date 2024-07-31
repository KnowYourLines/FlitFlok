import React from "react";
import RNPickerSelect from "react-native-picker-select";

export default function CurrencyPicker({ currency, setCurrency }) {
  return (
    <RNPickerSelect
      placeholder={{
        label: currency || "No currency selected",
        value: currency || "",
      }}
      selectedValue={currency}
      onValueChange={(value) => setCurrency(value)}
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
        { label: "No currency selected", value: "" },
      ].filter((item) => item.value != currency)}
    />
  );
}
