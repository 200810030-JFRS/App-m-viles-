import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

export default function App() {
  const cursos = [
    { id: "1", titulo: "Aplicaciones móviles", duracion: "20 horas", rating: "5.0" },
    { id: "2", titulo: "Bases de datos", duracion: "30 horas", rating: "4.0" },
    { id: "3", titulo: "Diseño de redes", duracion: "40 horas", rating: "3.0" },
    { id: "4", titulo: "Arquitectura orientada a servicios", duracion: "50 horas", rating: "2.0" },
    { id: "5", titulo: "Mate", duracion: "60 horas", rating: "4.0" },
  ];

  const renderCard = ({item}) => (
    <TouchableOpacity      
      style = {styles.card}
      onPress = { () => manejaPresionCurso(item.curso)}
      activeOpacity = {0.7} >

      <View>
        <Text></Text>

      </View>

    </TouchableOpacity>
  );



  return (
    <View style={styles.container}>
      <Text>Mi lista de cursos</Text>
      <FlatList
        data={cursos}
        renderItem={renderCard}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#fff',
  },
  card: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#86e010',
    marginBottom: 4

  },
  subtitulo: {
    fontSize: 14,
    color: "#0c2b91"
  },
});
