// frontend/src/screens/SavedAllocations.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import api from "../api";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SLOTS = ["8:30-9:30","9:30-10:30","11:00-12:00","12:00-1:00","2:00-3:00","3:00-4:00"];

export default function SavedAllocations() {
  const [alloc, setAlloc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState({}); // section -> boolean

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getLatestAllocation();
      setAlloc(res?.allocation || null);
    } catch (err) {
      console.error("Error loading saved allocations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const listFor = (sec) => Array.isArray(alloc?.[sec]) ? alloc[sec] : [];

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, backgroundColor: "#fafafa" }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>📁 Last Saved Allocation</Text>

      {loading ? <ActivityIndicator size="large" color="#007bff" /> : !alloc ? (
        <Text>No saved allocations found.</Text>
      ) : (
        Object.keys(alloc).map((sec) => {
          const items = listFor(sec);
          const isOpen = !!expanded[sec];
          const visible = isOpen ? items : items.slice(0, 10);
          return (
            <View key={sec} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 6 }}>{sec}</Text>
              {DAYS.map((day) => (
                <View key={`${sec}-${day}`} style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: "600" }}>{day}</Text>
                  {visible
                    .filter(i => i.day === day)
                    .sort((a,b)=>a.slot.localeCompare(b.slot))
                    .map((i, idx) => (
                      <Text key={`${day}-${i.slot}-${idx}`} style={{ fontSize: 14 }}>
                        {i.slot} — {i.room ?? "—"} ({i.subject || i.type || ""})
                      </Text>
                    ))}
                </View>
              ))}
              {items.length > 10 && (
                <TouchableOpacity onPress={() => setExpanded(p => ({...p, [sec]: !isOpen}))} style={{ marginTop: 6 }}>
                  <Text style={{ color: "#007bff" }}>{isOpen ? "Show less" : `...and ${items.length - 10} more · Show all`}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
