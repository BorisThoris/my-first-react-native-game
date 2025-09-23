import React from 'react';
import { Room } from '../../../types/gameTypes';
import TreasureRoom from './TreasureRoom';
import ShopRoom from './ShopRoom';
import SecretRoom from './SecretRoom';
import LibraryRoom from './LibraryRoom';
import ChallengeRoom from './ChallengeRoom';
import DevilRoom from './DevilRoom';
import AngelRoom from './AngelRoom';
import RoomView from '../RoomView';

interface SpecialRoomRouterProps {
    room: Room;
    onComplete: () => void;
}

const SpecialRoomRouter: React.FC<SpecialRoomRouterProps> = ({ room, onComplete }) => {
    switch (room.type) {
        case 'treasure':
            return <TreasureRoom room={room} onComplete={onComplete} />;
        case 'shop':
            return <ShopRoom room={room} onComplete={onComplete} />;
        case 'secret':
            return <SecretRoom room={room} onComplete={onComplete} />;
        case 'library':
            return <LibraryRoom room={room} onComplete={onComplete} />;
        case 'challenge':
            return <ChallengeRoom room={room} onComplete={onComplete} />;
        case 'devil-room':
            return <DevilRoom room={room} onComplete={onComplete} />;
        case 'angel-room':
            return <AngelRoom room={room} onComplete={onComplete} />;
        default:
            // Fallback to regular room view for memory chambers, boss rooms, etc.
            return <RoomView room={room} onBack={onComplete} />;
    }
};

export default SpecialRoomRouter;
