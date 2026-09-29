import React, { useState } from "react";
import { StyleSheet, Button, View, SafeAreaView, TextInput } from "react-native";
import CustomModal from "./componentes/CustomModal";

export default function App (){
  const [modalVisible, setModalVisible] = useState(false);
  const [texto, setTexto] = useState("");
  const objetoContenido = { valor: texto };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <CustomModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  contenido={ objetoContenido }
              />
              <TextInput
                style={styles.input}
                placeholder="Escribe un texto"
                value={texto}
                onChangeText={setTexto}
              />
              <Button
                title="Mostrar Modal"
                onPress={() => setModalVisible(true)}
              />
            </View>
        </SafeAreaView>
    );
}

const styles= StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  input: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#b8bec8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
})