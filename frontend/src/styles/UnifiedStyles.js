// frontend/src/styles/UnifiedStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 20,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  card: {
    backgroundColor: "#007AFF",
    width: "45%",
    paddingVertical: 20,
    marginVertical: 10,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  logoutContainer: {
    marginTop: 30,
    width: "60%",
  },
});
