import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface UserInfo {
  email: string;
  nome: string;
}

interface UserInfoCardProps {
  userInfo: UserInfo;
  isEditing?: boolean;
  editedInfo?: { email: string; nome: string };
  onEmailChange?: (email: string) => void;
  onNomeChange?: (nome: string) => void;
}

export default function UserInfoCard({ 
  userInfo, 
  isEditing = false, 
  editedInfo,
  onEmailChange,
  onNomeChange 
}: UserInfoCardProps) {
  // Exibir informações do usuário
  const displayInfo = isEditing && editedInfo ? editedInfo : userInfo;

  return (
    <View style={styles.container}>
      {/* Seção de Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={40} color="#fff" />
          </View>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="camera-alt" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        {!isEditing && <Text style={styles.userName}>{userInfo.nome}</Text>}
      </View>

      {/* Seção de Email */}
      <View style={styles.infoSection}>
        <View style={styles.fieldRow}>
          <View style={styles.fieldInfo}>
            <Text style={styles.fieldLabel}>Email:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={displayInfo.email}
                onChangeText={onEmailChange}
                placeholder="Digite o email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.fieldValue}>{userInfo.email}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Seção de Nome */}
      <View style={styles.infoSection}>
        <Text style={styles.fieldLabel}>Nome:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={displayInfo.nome}
            onChangeText={onNomeChange}
            placeholder="Digite o nome"
            autoCapitalize="words"
          />
        ) : (
          <Text style={styles.fieldValue}>{userInfo.nome}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9e9e9e",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff5722",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  infoSection: {
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginTop: 4,
  },
});
