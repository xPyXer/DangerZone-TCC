import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import ProfileHeader from '../../components/ProfileHeader';
import UserInfoCard from '../../components/UserInfoCard';
import { useAuth } from '../../context/authContext';
import { userService } from '../../service/userServices';

export default function ProfileScreen() {
  const { user, updateUser: updateUserContext } = useAuth();
  const [userInfo, setUserInfo] = useState({ email: '', nome: '' });
  const [editedInfo, setEditedInfo] = useState({ email: '', nome: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      if (user) {
        // Primeiro, tenta usar os dados do contexto
        const initialInfo = {
          email: user.email || '',
          nome: user.fullName || '',
        };
        setUserInfo(initialInfo);
        setEditedInfo(initialInfo);
        
        // Se os dados estiverem incompletos, tenta buscar do servidor
        if ((!user.email || !user.fullName) && user.id) {
          setLoading(true);
          setError(null);
          try {
            console.log('Buscando dados atualizados do usuário...');
            const updatedUser = await userService.getCurrentUser();
            console.log('Dados atualizados recebidos:', updatedUser);
            
            if (updatedUser) {
              const updatedInfo = {
                email: updatedUser.email || user.email || '',
                nome: updatedUser.fullName || user.fullName || '',
              };
              setUserInfo(updatedInfo);
              setEditedInfo(updatedInfo);
            }
          } catch (err: any) {
            console.error('Erro ao buscar dados do usuário:', err);
            setError('Erro ao carregar dados do perfil');
            // Mantém os dados do contexto mesmo com erro
          } finally {
            setLoading(false);
          }
        }
      }
    };

    loadUserInfo();
  }, [user]);

  const handleEdit = () => {
    setEditedInfo({ ...userInfo });
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditedInfo({ ...userInfo });
    setIsEditing(false);
    setError(null);
  };

  const handleUpdate = async () => {
    if (!editedInfo.email.trim() || !editedInfo.nome.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setUpdating(true);
    setError(null);
    try {
      await updateUserContext(editedInfo.nome, editedInfo.email);
      setUserInfo({ ...editedInfo });
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfileHeader />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <UserInfoCard 
          userInfo={userInfo} 
          isEditing={isEditing}
          editedInfo={editedInfo}
          onEmailChange={(email: string) => setEditedInfo({ ...editedInfo, email })}
          onNomeChange={(nome: string) => setEditedInfo({ ...editedInfo, nome })}
        />
        
        {/* Botões de Editar/Atualizar/Cancelar */}
        <View style={styles.buttonContainer}>
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={handleEdit}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]} 
                onPress={handleCancel}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.updateButton]} 
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.updateButtonText}>Atualizar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1 },
  contentContainer: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  errorContainer: {
    backgroundColor: '#fee',
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#3B82F6',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
