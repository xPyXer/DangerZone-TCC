import { useReports } from "@/context/reportContext";
import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  FlatList,
  Modal,
  Switch,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { AZURE_MAPS_KEY } from "@env";
import { MaterialIcons } from "@expo/vector-icons";
import { CustomPicker } from "../../components/CustomPicker";
import { TimeInput } from "../../components/TimeInput";
import { INCIDENT_TYPES } from "../../types/reports";

interface SearchResult {
  position: {
    lat: number;
    lon: number;
  };
  address: {
    freeformAddress: string;
  };
  poi?: {
    name: string;
  };
}

export default function MakeReport() {
  const { addReport, loading } = useReports();

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(true);

  const [anonymous, setAnonymous] = useState(false);
  const [incidentType, setIncidentType] = useState<any>(null);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  // 
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão negada", "Não foi possível acessar sua localização.");
          setGettingLocation(false);
          return;
        }
        // Pegar a localização atual
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;

        setCoords({ latitude, longitude });

        try {
          const response = await fetch(
            `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&query=${latitude},${longitude}&subscription-key=${AZURE_MAPS_KEY}`
          );
          const data = await response.json();
          const address = data?.addresses?.[0]?.address?.freeformAddress;
          if (address) setSearchQuery(address);
        } catch {}
      } catch {
        Alert.alert("Erro", "Falha ao obter localização.");
      } finally {
        setGettingLocation(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    // Auto-completar para a procurar a localização
    const fetchAutocomplete = async () => {
      setAutocompleteLoading(true);
      try {
        const url = `https://atlas.microsoft.com/search/address/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${encodeURIComponent(
          searchQuery
        )}&typeahead=true&limit=5`;
        const res = await axios.get(url);
        if (res.data && res.data.results) {
          setSearchResults(res.data.results);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      } catch {
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setAutocompleteLoading(false);
      }
    };

    const timeout = setTimeout(fetchAutocomplete, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const selectSearchResult = (result: SearchResult) => {
    setSearchQuery(result.address.freeformAddress);
    setCoords({
      latitude: result.position.lat,
      longitude: result.position.lon,
    });
    setShowResults(false);
  };

  const resetForm = () => {
    setAnonymous(false);
    setIncidentType("");
    setTime("");
    setDescription("");
    setSearchQuery("");
    setCoords(null);
  };
  //
  const handleSubmit = async () => {
    if (!incidentType) return Alert.alert("Erro", "Selecione o tipo de incidente");
    if (!time) return Alert.alert("Erro", "Informe o horário");
    if (!searchQuery.trim()) return Alert.alert("Erro", "Informe a localização");
    if (!description.trim()) return Alert.alert("Erro", "Informe o resumo");

    try {
      let finalCoords = coords;

      if (searchQuery && (!coords || showResults)) {
        const url = `https://atlas.microsoft.com/search/fuzzy/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`;
        const res = await axios.get(url);
        if (res.data.results?.length) {
          const pos = res.data.results[0].position;
          finalCoords = { latitude: pos.lat, longitude: pos.lon };
        }
      }

      if (!finalCoords) return Alert.alert("Erro", "Não foi possível determinar a localização.");
      console.log({
        endereco: searchQuery,
        latitude: finalCoords.latitude,
        longitude: finalCoords.longitude,
        anonymous,
        crimeType: incidentType,
        descricao: description,
        horario: time
      });
      
        await addReport({
          crimeType: incidentType,
          latitude: finalCoords.latitude,
          longitude: finalCoords.longitude,
          endereco: searchQuery,
          anonymous,
          descricao: description,
        });

      setShowPopup(true);
      resetForm();
    } catch (error: any) {
      Alert.alert("Erro", "Erro ao criar reporte");
    }
  };
  // Trecho que redireciona o usuário ao site do governo de São Paulo para a criação do boletim de ocorrência
  const handleAcceptRedirect = () => {
    setShowPopup(false);
    const url =
      "https://www.delegaciaeletronica.policiacivil.sp.gov.br/ssp-de-cidadao/pages/comunicar-ocorrencia";
    Linking.openURL(url);
  };

  if (gettingLocation) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Obtendo localização...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <Text style={styles.title}>Registrar Reporte</Text>

      {/* Anônimo */}
      <View style={styles.fieldGroup}>
        <View style={styles.anonymousSection}>
          <View style={styles.anonymousLabel}>
            <MaterialIcons name="person" size={20} color="#666" />
            <Text style={styles.fieldLabel}>Anônimo?</Text>
          </View>
          <Switch
            value={anonymous}
            onValueChange={setAnonymous}
            trackColor={{ false: "#ddd", true: "#007AFF" }}
          />
        </View>
      </View>

      {/* Tipo de incidente */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Tipo de Incidente</Text>
        <CustomPicker
          items={INCIDENT_TYPES}
          selectedValue={incidentType}
          onValueChange={setIncidentType}
          placeholder="Escolha"
        />
      </View>

      {/* Horário */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Horário</Text>
        <TimeInput value={time} onTimeChange={setTime} placeholder="00:00" />
      </View>

      {/* Localização */}
      <Text style={styles.label}>Localização:</Text>
      <View style={styles.searchBar}>
        <MaterialIcons name="place" size={22} color="#9CA3AF" />
        <TextInput
          style={styles.input}
          placeholder="Digite o endereço ou lugar"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {autocompleteLoading && <ActivityIndicator size="small" color="#007AFF" />}
      </View>

      {showResults && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => selectSearchResult(item)}>
                <MaterialIcons name="location-on" size={20} color="#007AFF" />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultName}>{item.poi?.name || "Local"}</Text>
                  <Text style={styles.resultAddress}>{item.address.freeformAddress}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Resumo */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Resumo</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Descreva o ocorrido..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      {/* Enviar */}
      <TouchableOpacity
        disabled={loading}
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>{loading ? "Salvando..." : "Enviar Reporte"}</Text>
      </TouchableOpacity>

      {/* Popup */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.popupBackground}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Quer ser redirecionado para registrar B.O?</Text>

            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowPopup(false)}
              >
                <Text style={styles.popupButtonText}>Recusar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.popupButton, { backgroundColor: "#007AFF" }]}
                onPress={handleAcceptRedirect}
              >
                <Text style={[styles.popupButtonText, { color: "#fff" }]}>Aceitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#007AFF", padding: 20},

  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 16, fontWeight: "500", marginBottom: 8 },

  anonymousSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  anonymousLabel: { flexDirection: "row", alignItems: "center" },

  textArea: {
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },

  label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: "#1F2937",
    paddingVertical: 10,
  },
  resultsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultTextContainer: { flex: 1, marginLeft: 12 },
  resultName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  resultAddress: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  popupBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  popupButtons: { flexDirection: "row", justifyContent: "space-between" },
  popupButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  popupButtonText: { fontSize: 16, fontWeight: "600" },
});
