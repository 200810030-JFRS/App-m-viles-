import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// Cambia esta IP por la dirección real de tu computadora en la red local.
const MOVIES_API_URL = 'localhost:4000/movies';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Estados para el Modal de Agregar Película
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlot, setNewPlot] = useState('');
  const [newPoster, setNewPoster] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timeout = setTimeout(() => {
      controller.abort();
      setError('The movie server did not respond within 15 seconds. Reload the app to try again.');
      setLoading(false);
    }, 15000);

    const loadMovies = async () => {
      try {
        const response = await fetch(MOVIES_API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Could not load movies (HTTP ${response.status}).`);
        }

        // CÓDIGO ACTUALIZADO:
      const data = await response.json();

       // Imprime en consola para ver exactamente qué responde el servidor
      console.log('Respuesta de la API:', data);

       // Si la API devuelve un arreglo directamente: [...]
      if (Array.isArray(data)) {
       setMovies(data);
      } 
       // Si la API devuelve un objeto con la propiedad "movies": { movies: [...] }
      else if (Array.isArray(data.movies)) {
      setMovies(data.movies);
       } 
       // Si la API devuelve un objeto con la propiedad "data": { data: [...] }
      else if (Array.isArray(data.data)) {
       setMovies(data.data);
       } 
      else {
        throw new Error('La API no devolvió una lista válida de películas.');
      }

      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        clearTimeout(timeout);
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadMovies();

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const handleAddMovie = async () => {
    if (!newTitle.trim()) {
      alert('Por favor ingresa al menos un título para la película.');
      return;
    }

    setIsSubmitting(true);
    const newMovieData = {
      title: newTitle,
      fullplot: newPlot,
      poster: newPoster,
    };

    try {
      const response = await fetch(MOVIES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMovieData),
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar la película.');
      }

      const createdMovie = await response.json();
      
      // Actualiza la lista localmente
      setMovies((prevMovies) => [createdMovie, ...prevMovies]);

      // Reinicia el formulario y cierra el modal
      setNewTitle('');
      setNewPlot('');
      setNewPoster('');
      setIsAddModalVisible(false);
    } catch (err) {
      alert(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
        <StatusBar style="auto" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalles de ${item.title}`}
      accessibilityHint="Abre la ficha completa de la película"
      onPress={() => setSelectedMovie(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {item.poster ? (
        <Image
          source={{ uri: item.poster }}
          style={styles.poster}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.poster, styles.noposter]}>
          <Text>Sin imagen</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.plot}>{item.fullplot || 'Sin descripción'}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.list}>{error}</Text>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text>No movies loaded.</Text>}
        />
      )}

      {/* Botón Flotante para Agregar Película */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar nueva película"
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Modal de Detalle de Película */}
      <Modal
        animationType="fade"
        transparent
        visible={Boolean(selectedMovie)}
        statusBarTranslucent
        onRequestClose={() => setSelectedMovie(null)}
      >
        <Pressable
          accessibilityLabel="Cerrar detalles de la película"
          onPress={() => setSelectedMovie(null)}
          style={styles.modalBackdrop}
        >
          {selectedMovie ? (
            <Pressable
              accessibilityViewIsModal
              onPress={(event) => event.stopPropagation()}
              style={styles.modalCard}
            >
              <ScrollView
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                {selectedMovie.poster ? (
                  <Image
                    source={{ uri: selectedMovie.poster }}
                    style={styles.modalPoster}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.modalPoster, styles.noposter]}>
                    <Text>Sin imagen</Text>
                  </View>
                )}
                <Text style={styles.modalTitle}>{selectedMovie.title}</Text>
                <Text style={styles.modalPlot}>
                  {selectedMovie.fullplot || 'Sin descripción'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  onPress={() => setSelectedMovie(null)}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </Pressable>
              </ScrollView>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>

      {/* Modal para Agregar Película */}
      <Modal
        animationType="slide"
        transparent
        visible={isAddModalVisible}
        statusBarTranslucent
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsAddModalVisible(false)}
        >
          <Pressable
            accessibilityViewIsModal
            onPress={(e) => e.stopPropagation()}
            style={styles.modalCard}
          >
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Agregar Película</Text>

              <TextInput
                style={styles.input}
                placeholder="Título de la película"
                placeholderTextColor="#999"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción (Plot)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={newPlot}
                onChangeText={setNewPlot}
              />

              <TextInput
                style={styles.input}
                placeholder="URL del Poster (opcional)"
                placeholderTextColor="#999"
                value={newPoster}
                onChangeText={setNewPoster}
              />

              <Pressable
                accessibilityRole="button"
                onPress={handleAddMovie}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.closeButtonPressed,
                  isSubmitting && { opacity: 0.6 },
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.closeButtonText}>Guardar</Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setIsAddModalVisible(false)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.closeButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6F8',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 14,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F3542',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  poster: {
    width: 100,
    height: 140,
    borderRadius: 10,
  },
  noposter: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4EBEF',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 14,
  },
  plot: {
    fontSize: 13,
    lineHeight: 19,
    color: '#667680',
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#173B4C',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: 'rgba(10, 28, 37, 0.76)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#07151C',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalContent: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  modalPoster: {
    width: 200,
    height: 300,
    borderRadius: 14,
    backgroundColor: '#E4EBEF',
  },
  modalTitle: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    textAlign: 'center',
    color: '#173B4C',
  },
  modalPlot: {
    alignSelf: 'stretch',
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: '#526772',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    minHeight: 48,
    marginTop: 20,
    borderRadius: 14,
    backgroundColor: '#173B4C',
  },
  closeButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Nuevos Estilos para Agregar Película */
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: -3,
  },
  input: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D0D7DE',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 15,
    color: '#173B4C',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    minHeight: 48,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    minHeight: 48,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667680',
  },
});