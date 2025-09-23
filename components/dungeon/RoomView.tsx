import React from 'react';
import { Room } from '../../types/gameTypes';
import MemoryGame from '../memory/MemoryGame';

interface RoomViewProps {
    room: Room;
    onBack: () => void;
}

const RoomView: React.FC<RoomViewProps> = ({ room, onBack }) => {
    return (
        <MemoryGame
            room={room}
            onComplete={onBack}
            onBack={onBack}
            title="Memory Chamber"
            subtitle="Find matching pairs to clear the room!"
            instruction="Find matching pairs to clear the room!"
            showHelperPanel={false}
            showCheatButton={true}
        />
    );
};

export default RoomView;
