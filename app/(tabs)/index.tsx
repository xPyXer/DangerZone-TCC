import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import axios from "axios";
import { useHeatmap, HeatmapPoint } from "@/context/HeatmapContext";
import { AZURE_MAPS_KEY } from "@env";

// Interface para resultado de busca Azure Maps
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

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [region, setRegion] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Contexto do heatmap
  const { heatmapData, loading: loadingHeatmap, error: heatmapError, fetchData: fetchHeatmap } = useHeatmap();

  // Inicialização: localização e heatmap
  useEffect(() => {
    (async () => {
      const pos = await initializeMap();
      if (pos) {
        await fetchHeatmap(pos.latitude, pos.longitude);
      }
    })();
  }, []);

  // Atualização automática do heatmap a cada 10 segundos
  useEffect(() => {
    if (!region || !region.latitude || !region.longitude) return;

    const lat = region.latitude;
    const lon = region.longitude;

    // Buscar heatmap imediatamente quando a região mudar
    const updateHeatmap = () => {
      fetchHeatmap(lat, lon);
    };32
    // Atualizar imediatamente quando a região mudar
    updateHeatmap();

    // Configurar intervalo para atualizar a cada 10 segundos
    const interval = setInterval(() => {
      updateHeatmap();
    }, 10000); // 10 segundos

    // Limpar intervalo quando o componente desmontar ou região mudar
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region?.latitude, region?.longitude]);

  // ---- Funções de inicialização ----
  const initializeMap = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Não foi possível acessar localização.");
        const fallback = { latitude: -23.5438, longitude: -46.5610 };
        setRegion({ ...fallback, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        return fallback;
      }
      // Obter a localização atual
      const pos = await Location.getCurrentPositionAsync({});
      // Definir a região
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setRegion({ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 });
      return coords; 
    } catch {
      const fallback = { latitude: -23.5438, longitude: -46.5610 };
      setRegion({ ...fallback, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      return fallback;
    }
  };

  // Busca automática ao digitar 3 caracteres
  useEffect(() => {
    // Se o query for menor que 3 caracteres, não exibir resultados
    if (searchQuery.length < 3) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    // Buscar autocomplete Azure Maps
    const fetchAutocomplete = async () => {
      setAutocompleteLoading(true);
      try {
        if (!AZURE_MAPS_KEY) {
          console.error('AZURE_MAPS_KEY não está definida');
          setSearchResults([]);
          setShowResults(false);
          return;
        }
        const encodedQuery = encodeURIComponent(searchQuery);
        const url = `https://atlas.microsoft.com/search/address/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${encodedQuery}&typeahead=true&limit=5`;
        const res = await axios.get(url);
        if (res.data && res.data.results) {
        setSearchResults(res.data.results);
        setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      } catch (err: any) {
        const errorData = err.response?.data;
        console.error('Erro ao buscar autocomplete Azure Maps:', errorData || err.message);
        
        // Tratamento específico para erro de autenticação
        if (errorData?.error?.code === 'LocalAuthDisabled') {
          console.error('ERRO: Autenticação local desabilitada no Azure Maps. Verifique as configurações da conta no Azure Portal.');
        }
        
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setAutocompleteLoading(false);
      }
    };
    const timeout = setTimeout(fetchAutocomplete, 400); // debounce
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // ---- Busca ao pressionar "Buscar" ou Enter ----
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
     const start = performance.now(); // Inicia medição do tempo de resposta
    setSearching(true);
    try {
      if (!AZURE_MAPS_KEY) {
        Alert.alert("Erro", "Chave do Azure Maps não configurada.");
        setSearching(false);
        return;
      }
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      const url = `https://atlas.microsoft.com/search/address/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${encodedQuery}&limit=1`;
      const result = await axios.get(url);
      if (!result.data.results || !result.data.results.length) {
        Alert.alert("Nenhum resultado", "Nenhum local encontrado.");
        return;
      }
      const pos = result.data.results[0].position;
      animateToLocation(pos.lat, pos.lon);
      setShowResults(false);
    } catch (err: any) {
      const errorData = err.response?.data;
      console.error('Erro ao buscar localização:', errorData || err.message);
      
      // Tratamento específico para erro de autenticação
      if (errorData?.error?.code === 'LocalAuthDisabled') {
        Alert.alert(
          "Erro de Autenticação", 
          "A autenticação local está desabilitada na sua conta do Azure Maps. " +
          "Por favor, habilite 'disableLocalAuth = false' no Azure Portal ou use autenticação Azure AD."
        );
      } else {
        Alert.alert("Erro", errorData?.error?.message || "Falha ao buscar local.");
      }
    } finally {
      setSearching(false);
          const end = performance.now(); // fim da medição
          console.log("⏱️ Tempo de resposta do botão BUSCAR:", (end - start).toFixed(2), "ms");
    }
  };

  // ---- Selecionar resultado do autocomplete ----
  const selectSearchResult = (result: SearchResult) => {
    animateToLocation(result.position.lat, result.position.lon);
    setShowResults(false);
    setSearchQuery(result.address.freeformAddress);
    // O heatmap será atualizado automaticamente pelo intervalo baseado na nova região
  };
  // ---- Anima para a localização especificada ----
  const animateToLocation = (lat: number, lon: number) => {
    const newRegion = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500);
    }
    // Não buscar heatmap ao pesquisar - será atualizado automaticamente pelo intervalo
  };

  // ---- Voltar para localização atual e atualizar heatmap ----
  const goToCurrentLocation = async () => {
      const start = performance.now(); // inicia medição
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Não foi possível acessar localização.");
        setGettingLocation(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      // Definir as coordenadas
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      
      setRegion(coords);
      if (mapRef.current) {
        mapRef.current.animateToRegion(coords, 500);
      }
      
      // Atualizar heatmap imediatamente para a localização atual
      await fetchHeatmap(coords.latitude, coords.longitude);
    } catch (err) {
      console.error('Erro ao obter localização:', err);
      Alert.alert("Erro", "Não foi possível obter sua localização.");
    } finally {
      setGettingLocation(false);
       const end = performance.now();
    console.log("⏱️ Tempo de resposta do botão MINHA LOCALIZAÇÃO:", (end - start).toFixed(2), "ms");
    }
  };
  

  // ---- UI ----
  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 8 }}>Carregando localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>Danger Zone</Text>
        </View>
      </View>

      {/* Busca e Autocomplete */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Digite o endereço ou lugar"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={searchLocation}
          />
          {autocompleteLoading && (
            <ActivityIndicator size="small" color="#3B82F6" style={{ marginLeft: 8 }} />
          )}
          {searchQuery ? (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setShowResults(false); }}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, searching && { opacity: 0.6 }]}
          onPress={searchLocation}
          disabled={searching}
        >
          <MaterialIcons name="search" size={18} color="#fff" />
          <Text style={styles.searchButtonText}>{searching ? "Buscando..." : "Buscar"}</Text>
        </TouchableOpacity>
        {/* Lista de resultados (autocomplete) */}
        {showResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => selectSearchResult(item)}
                >
                  <MaterialIcons name="place" size={20} color="#3B82F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultName}>
                      {item.poi?.name || "Local"}
                    </Text>
                    <Text style={styles.resultAddress}>
                      {item.address.freeformAddress}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.resultsList}
            />
          </View>
        )}
        
        {/* Erro Heatmap */}
        {heatmapError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{heatmapError}</Text>
            <TouchableOpacity onPress={() => fetchHeatmap(region?.latitude, region?.longitude)}>
              <Text style={styles.errorReload}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

        {/* Mapa */}
        {region && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {/* HEATMAP REAL AMARELO → LARANJA → VERMELHO */}
            {heatmapData.length > 0 && (
              <Heatmap
                points={heatmapData.map((p) => {
                  const w = p.weight ?? 1;

                  /* Normalizar peso para o heatmap. 
                  1 reporte o heatmap fica amarelo, a partir de 5 reports ele fica na cor laranja e acima de 20 ele fica vermelho.
                  Amarelo = Baixo Risco , Laranja = Risco Moderado, Vermelho = Risco Severo */
                  const normalized =
                    w >= 20 ? 1 :
                    w >= 10 ? 0.66 :
                    w >= 1  ? 0.33 :
                    0.1;

                  return {
                    ...p,
                    weight: normalized,
                  };
                })}
                radius={40}
                opacity={0.9}
                gradient={{
                  colors: [
                    "rgba(255, 255, 0, 0.60)",   
                    "rgba(243, 63, 4, 1)",  
                    "rgba(255, 0, 0, 1)",       
                  ],
                  startPoints: [0.33, 0.66, 1], // 1–10 / 11–20 / 21+
                  colorMapSize: 512,
                }}
              />
            )}

            {/* Marker da posição atual */}
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title="Sua Localização"
            />
          </MapView>
        )}

        {/* Overlay de carregamento heatmap */}
        {loadingHeatmap && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>Carregando mapa de calor...</Text>
          </View>
        )}


      {/* Botão para voltar à localização atual */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={goToCurrentLocation}
        disabled={gettingLocation}
      >
        {gettingLocation ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : (
          <MaterialIcons name="my-location" size={24} color="#3B82F6" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... os mesmos estilos da resposta anterior ...
  container: { flex: 1, backgroundColor: "#F9FAFB"},
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 25, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerTextContainer: { alignItems: "center" },
  headerTitle: { fontSize: 14, fontWeight: "400", color: "#6B7280", letterSpacing: 1, bottom: 20},
  headerSubtitle: { marginTop: 30,fontSize: 22, fontWeight: "700", color: "#3B82F6", letterSpacing: 1 },
  searchContainer: { padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 8, color: "#1F2937" },
  searchButton: { backgroundColor: "#3B82F6", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 },
  searchButtonText: { color: "#fff", fontSize: 15, fontWeight: "600", marginLeft: 8 },
  resultsContainer: { marginTop: 10, backgroundColor: "#fff", borderRadius: 12, maxHeight: 180, borderWidth: 1, borderColor: "#E5E7EB" },
  resultsList: { maxHeight: 180 },
  resultItem: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  resultTextContainer: { flex: 1, marginLeft: 12 },
  resultName: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  resultAddress: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  errorContainer: { marginTop: 8, alignItems: "center" },
  errorText: { color: "#DC2626", fontSize: 14 },
  errorReload: { color: "#3B82F6", marginTop: 4, textDecorationLine: "underline", fontSize: 13 },
  loadingOverlay: { position: "absolute", bottom: 20, alignSelf: "center", backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  loadingText: { fontSize: 14, color: "#6B7280" },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  myLocationButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
});
