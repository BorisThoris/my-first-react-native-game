import { StyleSheet } from 'react-native';

const gridStyles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center'
    }
});

export default gridStyles;
