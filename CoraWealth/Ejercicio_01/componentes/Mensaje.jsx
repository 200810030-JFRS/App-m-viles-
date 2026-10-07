import {StyleSheet, View, Text } from "react-native";

//const mitexto = "Mensaje desde un objeto";
//const num=22

//const double = (n)=> {return n*2;};

export default function Mensaje( props){
    return(
        <View>
            <Text style={estilos.formato_mensaje}>{ props.titulo }</Text>
            <Text style={estilos.formato_mensaje}>{ props.numero }</Text>
        </View> 

    );
}


const estilos = StyleSheet.create({
    formato_mensaje: {
        color: 'black',
        backgroundColor: 'yellow',
        fontSize: 20,
    },
});
