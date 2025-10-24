import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function SelectProfileScreen({ navigation }) {
  const { user, login } = useAuth();

  const [branch, setBranch] = useState(null);
  const [semester, setSemester] = useState(null);
  const [section, setSection] = useState(null);

  const [branchOpen, setBranchOpen] = useState(false);
  const [semOpen, setSemOpen] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);

  const branches = [
    { label: "Computer Science", value: "CSE" },
    { label: "Information Science", value: "ISE" },
    { label: "Electronics & Communication", value: "ECE" },
    { label: "Electrical & Electronics", value: "EEE" },
    { label: "Mechanical", value: "MECH" },
  ];

  const semesters = [
    { label: "1st Semester", value: "1" },
    { label: "3rd Semester", value: "3" },
    { label: "5th Semester", value: "5" },
    { label: "7th Semester", value: "7" },
  ];

  const sections = [
    { label: "Section A", value: "A" },
    { label: "Section B", value: "B" },
    { label: "Section C", value: "C" },
    { label: "Section D", value: "D" },
  ];

  const handleSave = async () => {
    if (!branch || !semester || !section) {
      Alert.alert("Select all fields before continuing");
      return;
    }

    try {
      const updatedUser = { ...user, branch, semester, section };

      // Save in backend (route fixed)
      await api.post("/faculty/save-profile", updatedUser);

      login(updatedUser);
      Alert.alert("Profile saved", "Redirecting to Dashboard...");
      navigation.replace("HomeTabs");
    } catch (err) {
      console.warn("Profile save error:", err.message);
      Alert.alert("Error", "Could not save profile. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Profile</Text>
      <Text style={styles.subtitle}>Choose branch, semester, and section</Text>

      <DropDownPicker
        open={branchOpen}
        value={branch}
        items={branches}
        setOpen={setBranchOpen}
        setValue={setBranch}
        placeholder="Select Branch"
        style={styles.dropdown}
        zIndex={3000}
        zIndexInverse={1000}
      />

      <DropDownPicker
        open={semOpen}
        value={semester}
        items={semesters}
        setOpen={setSemOpen}
        setValue={setSemester}
        placeholder="Select Semester"
        style={styles.dropdown}
        zIndex={2000}
        zIndexInverse={2000}
      />

      <DropDownPicker
        open={sectionOpen}
        value={section}
        items={sections}
        setOpen={setSectionOpen}
        setValue={setSection}
        placeholder="Select Section"
        style={styles.dropdown}
        zIndex={1000}
        zIndexInverse={3000}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2E86DE",
    textAlign: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  dropdown: {
    marginBottom: 20,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#2E86DE",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
