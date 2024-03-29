import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ConfigItem, configItems as configItemsImport, ConfigType, getConfigObject, InputOptions, SelectOptions } from "../../config/Config";
import { ConfigContext, useConfigContext } from "../../context/context";
import { mainConfigContext } from "../FilterInput";
import Checkbox from "./Checkbox";
import Input from "./Input";
import Select from "./Select";

// TODO: fix all elements and stylings proper

const ConfigModal = () => {
    const { config, setConfig, resetConfigToDefault } = useConfigContext();
    const [configState, setConfigState] = useState(config);
    const [configItems, setConfigItems] = useState(configItemsImport);
    const [needsToReload, setNeedsToReload] = useState(false);

    const refreshState = () => {
        setConfigItems(configItemsImport);
        setConfigState(getConfigObject());
    }

    const getConfigComponent = (configItem: ConfigItem) => {
        const currentValue = configState[configItem.key];

        const setValue = (newValue: any) => {
            if (newValue === "") {
                return;
            }

            setConfig(configItem.key, newValue);

            if (configItem.onValueChange) {
                const configNeedsToReload = configItem.onValueChange(newValue);

                if (configNeedsToReload) {
                    setNeedsToReload(configNeedsToReload);
                }
            }

            refreshState();
        };

        switch (configItem.type) {
            case ConfigType.Input:
                return <Input value={currentValue as any} setValue={setValue} options={configItem.options! as InputOptions} />;
            case ConfigType.Toggle:
                return <Checkbox value={currentValue as any} setValue={setValue} />;
            case ConfigType.Select:
                return <Select value={currentValue as any} setValue={setValue} options={configItem.options! as SelectOptions} />;
        }
    }

    const close = () => {
        if (needsToReload) {
            window.location.reload();
        } else {
            closeModal();
        }
    };

    const resetToDefault = () => {
        resetConfigToDefault();
        refreshState();
        setNeedsToReload(true);
    };

    return (
        <div
            className="GenericModal__overlay"
        >
            <style>
                {
                    `
                        .playlist-filter-config-description::after {
                            content: '' !important;
                        }
                    `
                }
            </style>
            <div
                className="GenericModal"
                role="dialog"
                aria-label="Playlist filter config"
                aria-modal="true"
            >
                <div
                    className="main-embedWidgetGenerator-container"
                    style={{
                        width: "100%"
                    }}
                >
                    <div
                        className="main-trackCreditsModal-header"
                    >
                        <h1
                            className="main-type-alto"
                        >
                            Playlist filter config
                        </h1>
                        <Spicetify.ReactComponent.TooltipWrapper label="Save / Close" showDelay={100}>
                            <button
                                onClick={close}
                                aria-label="Close"
                                className="main-trackCreditsModal-closeBtn"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 32 32"
                                    xmlns="http://www.w3.org/2000/svg"
                                >

                                    <path
                                        d="M31.098 29.794L16.955 15.65 31.097 1.51 29.683.093 15.54 14.237 1.4.094-.016 1.508 14.126 15.65-.016 29.795l1.414 1.414L15.54 17.065l14.144 14.143"
                                        fill="currentColor"
                                        fill-rule="evenodd"
                                    />
                                </svg>
                            </button>
                        </Spicetify.ReactComponent.TooltipWrapper>
                    </div>
                    <div
                        className="main-trackCreditsModal-mainSection"
                    >
                        <main>
                            <div className="x-settings-container">
                                {
                                    configItems
                                        .map(section => (
                                            <div
                                                className="x-settings-section"
                                                style={{ marginTop: 20 }}
                                            >
                                                {
                                                    section
                                                        .filter(configItem => !configItem.subKeyOf || configState[configItem.subKeyOf])
                                                        .map(configItem => {
                                                            return (
                                                                configItem.type === ConfigType.Title ?
                                                                    <>
                                                                        <h2 className="Type__TypeElement-sc-goli3j-0 bDOlOS">{configItem.label}</h2>
                                                                        {
                                                                            configItem.description &&
                                                                            (
                                                                                <div
                                                                                    className="Type__TypeElement-sc-goli3j-0 dvSMET main-trackCreditsModal-creditsEntry playlist-filter-config-description"
                                                                                >
                                                                                    {configItem.description}
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </>
                                                                    : (
                                                                        <div
                                                                            className="x-settings-row"
                                                                            style={{
                                                                                marginLeft: configItem.subKeyOf ? 15 : 0
                                                                            }}
                                                                        >
                                                                            <div className="x-settings-firstColumn"
                                                                                style={{
                                                                                    display: "block"
                                                                                }}>
                                                                                <div className="Type__TypeElement-sc-goli3j-0 cOOTQS">
                                                                                    {configItem.label}
                                                                                </div>
                                                                                {
                                                                                    configItem.description &&
                                                                                    <div
                                                                                        className="Type__TypeElement-sc-goli3j-0 dvSMET main-trackCreditsModal-creditsEntry playlist-filter-config-description"
                                                                                    >
                                                                                        {configItem.description}
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                            <div className="x-settings-secondColumn">
                                                                                <span>
                                                                                    {getConfigComponent(configItem)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                            )
                                                        })
                                                }
                                            </div>
                                        ))
                                }
                                <div className="x-settings-section"
                                    style={{
                                        marginTop: 20,
                                        marginBottom: 20,
                                    }}>
                                    <div className="x-settings-row">
                                        <div className="x-settings-firstColumn" />
                                        <div className="x-settings-secondColumn">
                                            <button
                                                onClick={resetToDefault}
                                                style={
                                                    { "fontFamily": "var(--font-family,CircularSp,CircularSp-Arab,CircularSp-Hebr,CircularSp-Cyrl,CircularSp-Grek,CircularSp-Deva,var(--fallback-fonts,sans-serif))", "backgroundColor": "transparent", "borderRadius": "500px", "position": "relative", "textAlign": "center", "textDecoration": "none", "textTransform": "none", "touchAction": "manipulation", "transitionDuration": "33ms", "transitionProperty": "background-color, border-color, color, box-shadow, filter, transform", "userSelect": "none", "verticalAlign": "middle", "transform": "translate3d(0px, 0px, 0px)", "paddingBlock": "3px", "paddingInline": "15px", "border": "1px solid var(--essential-subdued,#878787)", "color": "var(--text-base,#fff)", "minBlockSize": "32px", "display": "inline-flex", "WebkitBoxAlign": "center", "alignItems": "center", "WebkitBoxPack": "center", "justifyContent": "center" }
                                                }>Reset to default</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div >
        </div >);
};

export default ConfigModal;

let modalElement: HTMLElement | null = null;

export function openConfigModal() {
    const body = document.querySelector("body");
    const div = document.createElement("div");

    div.setAttribute("class", "ReactModalPortal");

    ReactDOM.render(<ConfigContext.Provider value={mainConfigContext}><ConfigModal /></ConfigContext.Provider>, div);

    if (body) {
        modalElement = body.appendChild(div);
    }
}

function closeModal() {
    modalElement?.remove();
}