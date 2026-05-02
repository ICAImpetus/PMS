import React, { createContext, useContext, useState } from 'react';

const WebphoneToggleContext = createContext();

export const useWebphoneToggleInfo = () => {
    return useContext(WebphoneToggleContext);
};

const WebphoneToggleProvider = ({ children }) => {
    const [isWebphoneVisible, setIsWebphoneVisible] = useState(false);

    return (
        <WebphoneToggleContext.Provider value={{ isWebphoneVisible, setIsWebphoneVisible }}>
            {children}
        </WebphoneToggleContext.Provider>
    );
};

export default WebphoneToggleProvider;