import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    // General container for buttons (optional if more buttons exist)
    buttonContainer: {
        marginTop: 20
    },

    // Container for current level score positioned at the bottom-right
    currentScoreContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
        bottom: 10,
        padding: 10,
        position: 'absolute',
        right: 10 // Positioned at the bottom-right
    },

    // Text style for the current level score
    currentScoreText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },

    // Container for displaying the player's lives
    livesContainer: {
        left: 10,
        position: 'absolute',
        top: 10
    },
    // Container for displaying the player's character at the bottom-left
    playerContainer: {
        bottom: 10,
        left: 10,
        position: 'absolute'
    },

    // Rank container with a bold yellow font and shadow for standout effect
    rankContainer: {
        borderRadius: 5
    },

    rankText: {
        color: '#ffcc00',
        fontSize: 40,
        fontWeight: '900',
        textShadowColor: '#000',
        textShadowOffset: { height: 2, width: 2 },
        textShadowRadius: 5
    },

    // Container for total score at the top-right
    scoreContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
        padding: 10,
        position: 'absolute',
        right: 10,
        top: 10
    },

    // Text style for total score
    scoreText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold'
    }
});

export default styles;
