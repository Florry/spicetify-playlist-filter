import React, { useState } from "react";
import { Config, ConfigKey, getConfigObject, resetConfigToDefault, setConfig, toggleConfig } from "../config/Config";
import { ConfigState } from "../constants/constants";
import { ConfigContext } from "../context/context";

interface Props {
    children: React.ReactNode;
}

const ConfigContextProvider = ({ children }: Props) => {
    const [configObj, setConfigObj] = useState<Config>(getConfigObject());

    const stateSetConfig = (key: ConfigKey, value: any) => {
        setConfig(key, value);
        updateState();
    };

    const stateToggleConfig = (key: ConfigKey) => {
        toggleConfig(key);
        updateState();
    };

    const stateResetConfigToDefault = () => {
        resetConfigToDefault();
        updateState();
    };

    const updateState = () => setConfigObj(getConfigObject());


    const configState = {
        config: configObj,
        setConfig: stateSetConfig,
        toggleConfig: stateToggleConfig,
        resetConfigToDefault: stateResetConfigToDefault
    } as ConfigState;

    return (
        <ConfigContext.Provider value={configState}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigContextProvider;