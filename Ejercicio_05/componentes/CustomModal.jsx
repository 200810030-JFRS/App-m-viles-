import React from "react";
import { View, Text, Modal, StyleSheet, Button } from "react-native";

const CustomModal = ({ visible, onClose, contenido }) => {
  return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        >
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>
                    {contenido ? contenido.valor : 'Mundo'}
                </Text>
                <Button
                    title="Cerrar"
                    onPress = {onClose}/>
            </View>
        </View>
    </Modal>

  ); 
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    modalText: {
        marginBottom: 20,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "600"
    },

});

export default CustomModal;