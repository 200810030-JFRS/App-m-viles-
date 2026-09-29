import React, { useState } from "react";
import { StyleSheet, Button, View, SafeAreaView } from "react-native";
import CustomModal from "./Componentes/CustomModal";

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);

  const objetoContenido = {
    valor: "Juan Perez Jolote",
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          contenido={objetoContenido}
        />

        <Button
          title="Abrir modal"
          onPress={() => setModalVisible(true)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});