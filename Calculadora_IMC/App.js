import React, { useState } from "react";
import { StyleSheet, Button, View, SafeAreaView, TextInput } from "react-native";
import CustomModal from "./componentes/Modal";

export default function App (){
  const [modalVisible, setModalVisible] = useState(false);
  const [estatura, setEstatura] = useState("");
  const [peso, setPeso] = useState("");
  const IMC = peso / (estatura * estatura)

  let mensaje = ""

  if ( IMC<= 18.5 ) {
    mensaje = "Bajo de peso"
  } else if( IMC <= 24.9){
    mensaje = "peso normal"
  } else if( IMC <= 29.9){
    mensaje = "Pre obesidad o sobrepeso"
  }else if( IMC <= 34.9){
    mensaje = "Obesidad clase I"
  }else if( IMC <= 39.9){
    mensaje = "Obesidad clase II"
  }else if( IMC <= 40){
    mensaje = "Obesidad clase III"
  }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
              <CustomModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  contenido={ IMC }
                  mensaje = {mensaje}
              />
              <TextInput
                style={styles.input}
                placeholder="Estatura en Metros"
                value={estatura}
                onChangeText={setEstatura}
              />
              <TextInput
                style={styles.input}
                placeholder="Peso en Kilogramos"
                value={peso}
                onChangeText={setPeso}
              />
              <Button
                title="Calcular IMC"
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