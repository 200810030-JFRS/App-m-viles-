import {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Accelerometer} from 'expo-sensors';

export default function AccelerometerSensor() {
    const [datos, setDatos] = useState({ 
        x: 0, 
        y: 0, 
        z: 0 
    });

    useEffect(() => {
        //1.- Suscribirnos al sensor
        const suscripcion = Accelerometer.addListener(mediciones => {
            setDatos(mediciones);
        });


        //2.- Definir el intervalo de mediciones
        Accelerometer.setUpdateInterval(100); 

        //3.- Definir la des-suscripción 
        return () => {
            suscripcion.remove();
        }
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Acelerometro</Text>
            <View style={styles.card}>
                <Text style={styles.axis}>X:</Text>
                <Text style={styles.value}>{datos.x}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.axis}>Y:</Text>
                <Text style={styles.value}>{datos.y}</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.axis}>Z:</Text>
                <Text style={styles.value}>{datos.z}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 25,
        backgroundColor: '#808080',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#dc1212',
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    axis: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#256734"
        },
    value: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#7b0a73"
    },
});