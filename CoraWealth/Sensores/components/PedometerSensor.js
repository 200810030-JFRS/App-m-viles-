import {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Pedometer} from 'expo-sensors';

export default function PedometerSensor() {
    const [pasos, setPasos] = useState(0);
    const [disponible , setDisponible] = useState(false);

    useEffect(() => {
        let suscripcion;
        const iniciar = async () => {
            const disponible = await Pedometer.isAvailableAsync();
            setDisponible(disponible);
            
            if (disponible) {
                suscripcion = Pedometer.watchStepCount( resultado => {
                    setPasos(resultado);
                });
            }

        };

        iniciar();
        //cancelar la suscripción al salir
        return () => {
            if (suscripcion) {
                suscripcion.remove();
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pedometer</Text>
            <Text style={styles.axis}>
                Disponible: {disponible ? 'Sí' : 'No'}
            </Text>
            <View style={styles.card}>
                <Text style={styles.axis}>Pasos:</Text>
                <Text style={styles.value}>{pasos.steps}</Text>
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