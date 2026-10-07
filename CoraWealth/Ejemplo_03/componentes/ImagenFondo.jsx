import {View, ImageBackground, StyleSheet, Dimensions, Image, Text} from 'react-native';

export default function ImagenFondo(){
    return(
        <View>
            <ImageBackground style={styles.fondo} source={require('../assets/328318-Aatrox-LoL-4K-iphone-wallpaper.jpg')}>
           <View style={styles.fondoText}>
                <Text style={styles.texto}>Aatroximiliano</Text>
           </View>
            <View style={styles.container}>
            
            <Image source ={{uri:'https://cdn.pixabay.com/photo/2020/07/11/21/46/kawaii-5395394_1280.png'}} style={styles.foto}/>
            </View>
            </ImageBackground>
        </View>
    );

}

const styles = StyleSheet.create({
    fondo: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        resizeMode: 'contain',
    },
    foto:{
        opacity: 0.8,
        width: 260,
        height: 260,
        elevation: 8,
        borderRadius: 16,
        borderWidth: 10,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0, height: 6,},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texto: {
        fontSize: 40,
        color: '#f5efef',
        backgroundColor: 'rgba(0, 0, 0, .5)',
        width: Dimensions.get('window').width,
        textAlign: 'center',
    },
    fondoText: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 50,

    },
});
