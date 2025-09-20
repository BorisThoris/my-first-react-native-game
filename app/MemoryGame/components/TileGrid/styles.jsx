import { StyleSheet } from 'react-native';

const gridStyles = StyleSheet.create({
  grid: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  scrollContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default gridStyles;
