import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import ImcScreen from './src/screens/apps/ImcScreen';
import DivisasScreen from './src/screens/apps/DivisasScreen';
import DadosScreen from './src/screens/apps/DadosScreen';
import TicTacToeScreen from './src/screens/apps/TicTacToeScreen';
import MemoramaScreen from './src/screens/apps/MemoramaScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// --- Pantalla Inicio ---
function InicioScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.tree}>🌳</Text>
      <Text style={styles.title}>¡Bienvenido a Life!</Text>
      <Text style={styles.subtitle}>Abre el menú lateral 👉 para jugar</Text>
    </View>
  );
}

// --- Menú Inferior (Tabs) ---
function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32', // Color verde activo
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { paddingBottom: 5, height: 60, backgroundColor: '#FFFFFF' }
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={InicioScreen} 
        options={{ tabBarIcon: () => <Text style={{fontSize: 22}}>🏠</Text> }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={InicioScreen} 
        options={{ tabBarIcon: () => <Text style={{fontSize: 22}}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

// --- Menú Lateral (Drawer) ---
function DrawerNavigator() {
  return (
    <Drawer.Navigator 
      initialRouteName="MenuPrincipal"
      screenOptions={{
        drawerActiveTintColor: '#2E7D32', // Texto verde al seleccionar
        drawerActiveBackgroundColor: '#E8F5E9', // Fondo verde clarito al seleccionar
        drawerInactiveTintColor: '#424242',
        headerStyle: { backgroundColor: '#2E7D32' }, // Cabecera verde oscuro
        headerTintColor: '#fff', // Texto blanco en la cabecera
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <Drawer.Screen 
        name="MenuPrincipal" 
        component={TabNavigator} 
        options={{ title: 'Inicio 🏡' }} 
      />
      <Drawer.Screen 
        name="Memorama" 
        component={MemoramaScreen} 
        options={{ title: 'Memorama 🧠' }} 
      />
      <Drawer.Screen 
        name="IMC" 
        component={ImcScreen} 
        options={{ title: 'Salud IMC ⚖️' }} 
      />
      <Drawer.Screen 
        name="Divisas" 
        component={DivisasScreen} 
        options={{ title: 'Divisas 💵' }} 
      />
      <Drawer.Screen 
        name="Dados" 
        component={DadosScreen} 
        options={{ title: 'Lanzar Dados 🎲' }} 
      />
      <Drawer.Screen 
        name="TicTacToe" 
        component={TicTacToeScreen} 
        options={{ title: 'Tic Tac Toe ❌⭕' }} 
      />
    </Drawer.Navigator>
  );
}

// --- Orquestador Principal ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F1F8E9' // Fondo sutilmente verde para toda la app
  },
  tree: { fontSize: 80, marginBottom: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#616161', fontStyle: 'italic' }
});