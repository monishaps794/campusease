import React, { useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import api from "../api"; // ✅ this must match your api.js path

const AdminAllocationScreen = () => {
  const [allocResult, setAllocResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAllocator = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ use the helper function, not api.post
      const res = await api.autoAllocate();
      console.log("Allocator success:", res);
      setAllocResult(res.allocation || {});
    } catch (err) {
      console.error("Allocator error:", err);
      setError("Allocation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
        🧮 Auto Allocator
      </Text>

      <Button title={loading ? "Running..." : "Run Allocator"} onPress={runAllocator} disabled={loading} />

      {error && <Text style={{ color: "red", marginTop: 12 }}>❌ {error}</Text>}

      {allocResult && Object.keys(allocResult).length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>✅ Allocation Result:</Text>
          {Object.entries(allocResult).map(([section, rooms]) => (
            <Text key={section} style={{ marginBottom: 4 }}>
              {section}: {typeof rooms === "string" ? rooms : JSON.stringify(rooms)}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default AdminAllocationScreen;
