import { view, Text, StyleSheet} from 'react-native';
const MiComponente = () => {
return (
    <view> 
        <Text style={styles.color_texto}>Hola, Desde mi componente</Text>
    </view>
);
}

const styles = StyleSheet.create({
    color_texto: {
        color: 'red',
    },
});
export default MiComponente;