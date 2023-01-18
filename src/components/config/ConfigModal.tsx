import React from "react";
import ReactDOM from "react-dom";
import { ConfigItem, configItemsNew, ConfigType, defaultConfig, getConfig, InputOptions, resetConfigToDefault, SelectOptions, setConfig } from "../../config/Config";
import Checkbox from "./Checkbox";
import Input from "./Input";
import Select from "./Select";

// TODO: Fix styles & update of getConfigComponent when config changes

const ConfigModal = () => {
    // TODO: click outside modal to close

    const getConfigComponent = (config: ConfigItem) => {
        const currentValue = getConfig(config.key);

        const setValue = (newValue: any) => {
            console.log(config.key, newValue, "");

            if (newValue === "") {
                setConfig(config.key, defaultConfig[config.key]);
                return;
            }

            setConfig(config.key, newValue);
        };

        switch (config.type) {
            case ConfigType.Input:
                return <Input value={currentValue} setValue={setValue} options={config.options! as InputOptions} />;
            case ConfigType.Checkbox:
                return <Checkbox value={currentValue} setValue={setValue} />;
            case ConfigType.Select:
                return <Select value={currentValue} setValue={setValue} options={config.options! as SelectOptions} />;
        }
    }

    return (
        <div
            className="GenericModal__overlay"
        >
            <div
                className="GenericModal"
                role="dialog"
                aria-label="Playlist filter config"
                aria-modal="true"
            >
                <div
                    className="main-embedWidgetGenerator-container"
                >
                    <div
                        className="main-trackCreditsModal-header"
                    >
                        <h1
                            className="main-type-alto"
                        >
                            Playlist filter config
                        </h1>

                        <button
                            onClick={closeModal}
                            aria-label="Close"
                            className="main-trackCreditsModal-closeBtn"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 32 32"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <title>Close</title>
                                <path
                                    d="M31.098 29.794L16.955 15.65 31.097 1.51 29.683.093 15.54 14.237 1.4.094-.016 1.508 14.126 15.65-.016 29.795l1.414 1.414L15.54 17.065l14.144 14.143"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                    <div
                        className="main-trackCreditsModal-mainSection"
                    >
                        <main>
                            <div className="x-settings-container">
                                {
                                    configItemsNew
                                        .map(configItem => (
                                            <div
                                                className="x-settings-section"
                                                style={{ marginTop: 20 }}
                                            >
                                                {
                                                    configItem
                                                        .filter(config => !config.subKey || getConfig(config.subKey))
                                                        .map(configItem => (
                                                            configItem.type === ConfigType.Title ?
                                                                <h2 className="Type__TypeElement-sc-goli3j-0 bDOlOS">{configItem.label}</h2>
                                                                : (
                                                                    <div className="x-settings-row">
                                                                        <div className="x-settings-firstColumn"
                                                                            style={{
                                                                                display: "flex",
                                                                                flexWrap: "wrap"
                                                                            }}>
                                                                            <label className="Type__TypeElement-sc-goli3j-0 cOOTQS">
                                                                                {configItem.label}
                                                                            </label>
                                                                            {
                                                                                configItem.description &&
                                                                                <div
                                                                                    style={{
                                                                                        fontSize: "0.875rem",
                                                                                        boxSizing: "border-box",
                                                                                        marginBlock: 0,
                                                                                        fontWeight: 400,
                                                                                        color: "var(--text-subdued,#6a6a6a)",
                                                                                        fontFamily: "var(--font-family,CircularSp,CircularSp-Arab,CircularSp-Hebr,CircularSp-Cyrl,CircularSp-Grek,CircularSp-Deva,var(--fallback-fonts,sans-serif))",
                                                                                    }}
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
                                                        ))
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
                                        <div className="x-settings-firstColumn"></div>
                                        <div className="x-settings-secondColumn">
                                            <button
                                                onClick={resetConfigToDefault}
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

    ReactDOM.render(<ConfigModal />, div);

    if (body) {
        modalElement = body.appendChild(div);
    }
}

function closeModal() {
    modalElement?.remove();
}