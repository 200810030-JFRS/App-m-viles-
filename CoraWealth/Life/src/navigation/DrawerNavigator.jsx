import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import ImcScreen from '../screens/apps/ImcScreen';
import MemoramaScreen from '../screens/apps/MemoramaScreen';
import DivisasScreen from '../screens/apps/DivisasScreen';
import DadosScreen from '../screens/apps/DadosScreen';
import TicTacToeScreen from '../screens/apps/TicTacToeScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Menu">
      {/* El menú principal usa TabNavigation */}
      <Drawer.Screen name="Menu" component={TabNavigator} options={{ title: 'Life App' }} />
      
      {/* Mini apps disponibles desde el Drawer */}
      <Drawer.Screen name="Memorama" component={MemoramaScreen} />
      <Drawer.Screen name="IMC" component={ImcScreen} />
      <Drawer.Screen name="Divisas" component={DivisasScreen} />
      <Drawer.Screen name="Dados" component={DadosScreen} />
      <Drawer.Screen name="TicTacToe" component={TicTacToeScreen} />
    </Drawer.Navigator>
  );
}