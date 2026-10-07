import { StyleSheet, Text, View, TextInput, Button, ScrollView, Dimensions } from 'react-native';
import React, { useState } from 'react';

export default function RepText() {
    const [text, setText] = useState()
    const [enviar, setEnviar] = useState()

    return(
        <View style={misEstilos.container}>
            <View>
            <ScrollView style={misEstilos.scroll}>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>{enviar}</Text>
                <Text>Hola Mundo</Text>
                </ScrollView>
        </View>
        <View> 
            <TextInput
                style={misEstilos.input}
                placeholder='Escribe aquí...'
                defaultValue={text}
                onChangeText={(t) => setText(t)}
            />
            <Button
                title='Enviar'
                onPress={() => {
                    setEnviar(text)
                    alert("Texto enviado con exito")
                }}
            />
          </View>
        </View>
    );
}

const misEstilos = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: "100%",
        height: 40,
        backgroundColor: "#eee",
    },
    scroll:{
        width: Dimensions.get("window").width,  
    },

}); 