import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import doYouWantToPlayImage from '../../assets/images/doYouWantToPlay.jpg';
import { useGameContext } from '../../contexts/GameContext';
import ButtonComponent from './components/ButtonComponent';
import UserNameModal from './components/UserNameModal/UserNameModal';
import styles from './styles';

export default function GameScreen() {
    const { userName } = useGameContext();
    const [isModalVisible, setModalVisible] = useState(false);
    const [noSelected, setNoSelected] = useState(false);
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    const handleNoAction = useCallback(async () => {
        setNoSelected(true);
        const shakeValues = [15, -15, 0];
        const animations = shakeValues.map((value) =>
            Animated.timing(shakeAnimation, {
                duration: 100,
                toValue: value,
                useNativeDriver: true
            })
        );
        Animated.sequence(animations).start();
    }, [shakeAnimation]);

    const handleYesAction = useCallback(() => {
        router.push('/TileGame');
    }, [router]);

    const handleCloseModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    const openModalIfNoUserName = useCallback(() => {
        if (!userName) {
            setModalVisible(true);
        }
    }, [userName]);

    useMemo(() => {
        if (!userName) {
            openModalIfNoUserName();
        }
    }, [userName, openModalIfNoUserName]);

    const animatedImageStyle = useMemo(
        () => [styles.imageContainer, { transform: [{ translateX: shakeAnimation }] }],
        [shakeAnimation]
    );

    return (
        <View style={styles.container}>
            <UserNameModal isVisible={isModalVisible} onClose={handleCloseModal} />

            {userName && (
                <>
                    <Text style={styles.greetingText}>Hello, {userName}!</Text>
                    <Animated.View style={animatedImageStyle}>
                        <Image source={doYouWantToPlayImage} style={styles.image} />
                    </Animated.View>

                    <View style={styles.buttonContainer}>
                        <ButtonComponent text="Yes" onPress={handleYesAction} />
                        {!noSelected ? (
                            <ButtonComponent text="No" onPress={handleNoAction} isNoButton />
                        ) : (
                            <ButtonComponent text="Yes" onPress={handleYesAction} />
                        )}
                    </View>

                    {noSelected && <Text style={styles.noOptionText}>No was never an option</Text>}
                </>
            )}
        </View>
    );
}
