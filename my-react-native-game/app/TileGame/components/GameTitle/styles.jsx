import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 20
    },
    container: {
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 20
    },
    title: {
        color: '#2c3e50', // Dark blueish color to match the screenshot
        fontSize: 48, // Large font size for the title, similar to the screenshot
        fontWeight: 'bold', // Center alignment
        letterSpacing: 1.5, // Uppercase for a bold, game title feel
        marginBottom: 10, // Bold weight to match the title's appearance
        textAlign: 'center', // Subtle letter spacing for a clean look
        textShadowColor: '#000000', // Dark shadow for depth
        textShadowOffset: { height: 2, width: 1 }, // Slight shadow offset to mimic the depth effect in the screenshot
        textShadowRadius: 3, // Subtle shadow blur for softening the edges
        textTransform: 'uppercase' // Adds spacing below the title
    }
});

export default styles;
