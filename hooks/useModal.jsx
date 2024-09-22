import React, { useCallback, useMemo, useState } from 'react';

export const useModal = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const hideModal = useCallback(() => {
        setModalVisible(false);
        setModalMessage('');
    }, []);

    const showModal = useCallback((title, message) => {
        setModalMessage(`${title}: ${message}`);
        setModalVisible(true);
    }, []);

    return useMemo(() => {
        return { hideModal, modalMessage, modalVisible, setModalMessage, setModalVisible, showModal };
    }, [modalMessage, modalVisible, showModal, hideModal]);
};

export default useModal;
