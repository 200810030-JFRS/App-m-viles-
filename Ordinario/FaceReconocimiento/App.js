import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [photo, setPhoto] = useState(null);
  const [rostroDetectado, setRostroDetectado] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  // Fase 1: Solicitar permiso para usar la cámara
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Se requiere permiso para acceder a la cámara del dispositivo.
        </Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder Permiso de Cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fase 2: Callback de detección de rostros
  const handleFacesDetected = ({ faces }) => {
    if (faces && faces.length > 0) {
      setRostroDetectado(true);
    } else {
      setRostroDetectado(false);
    }
  };

  // Fase 1: Capturar fotografía
  const tomarFoto = async () => {
    if (cameraRef.current) {
      const fotoCapturada = await cameraRef.current.takePictureAsync();
      setPhoto(fotoCapturada.uri);
    }
  };

  const alternarCamara = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <SafeAreaView style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Text style={styles.title}>Fotografía Capturada</Text>
          <Image source={{ uri: photo }} style={styles.previewImage} />
          <TouchableOpacity style={styles.btnPrimary} onPress={() => setPhoto(null)}>
            <Text style={styles.btnText}>Volver a la Cámara</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            onFacesDetected={handleFacesDetected}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
              runClassifications: FaceDetector.FaceDetectorClassifications.none,
              minDetectionInterval: 150,
              tracking: true,
            }}
          >
            {/* Fase 2: Mostrar mensaje SOLO cuando se detecta un rostro */}
            {rostroDetectado && (
              <View style={styles.faceAlertBox}>
                <Text style={styles.faceAlertText}>Rostro detectado</Text>
              </View>
            )}

            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.btnSecondary} onPress={alternarCamara}>
                <Text style={styles.btnText}>Voltear</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureBtn} onPress={tomarFoto}>
                <View style={styles.captureInner} />
              </TouchableOpacity>

              <View style={{ width: 70 }} />
            </View>
          </CameraView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  faceAlertBox: {
    marginTop: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#A5D6A7',
  },
  faceAlertText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 35,
    paddingHorizontal: 20,
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
  },
  btnPrimary: {
    backgroundColor: '#1565C0',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnSecondary: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    width: 75,
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  previewImage: {
    width: '90%',
    height: '65%',
    borderRadius: 12,
    marginBottom: 24,
  },
});
