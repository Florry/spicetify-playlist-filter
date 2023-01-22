import React, { useState } from "react";
import SpotifyIcon from "../assets/icons/SpotifyIcon";
import { useFilterContext } from "../context/context";

const NowPlayingIndicator = () => {
    const { isPlaying } = useFilterContext();
    const [isHovering, setIsHovering] = useState(false);

    const pausePlayPlayback = () => {
        if (isPlaying) {
            Spicetify.Player.pause();
        } else {
            Spicetify.Player.play();
        }
    }

    return (
        <div className="main-rootlist-statusIcons">
            <button
                class={`CCeu9OfWSwIAJqA49n84 ZcKzjCkYGeMizcSAP8UX ${(isHovering || !isPlaying) && "NdVm10_yLWkkgq87jOMk"}`}
                aria-label={isHovering ? "Pause" : "Now playing"}
                tabindex="0"
                style={{
                    // @ts-ignore
                    "--button-size": 12
                }}
                onMouseOver={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={pausePlayPlayback}
            >
                <svg role="img"
                    height="12"
                    width="12"
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    data-encore-id="icon"
                    className="Svg-sc-ytk21e-0 uPxdw"
                >
                    {(!isHovering) && <>
                        <path d="M9.741.85a.75.75 0 01.375.65v13a.75.75 0 01-1.125.65l-6.925-4a3.642 3.642 0 01-1.33-4.967 3.639 3.639 0 011.33-1.332l6.925-4a.75.75 0 01.75 0zm-6.924 5.3a2.139 2.139 0 000 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 010 4.88z" />
                        <path d="M11.5 13.614a5.752 5.752 0 000-11.228v1.55a4.252 4.252 0 010 8.127v1.55z" />
                    </>}
                    {isHovering && isPlaying && <path d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z" />}
                    {isHovering && !isPlaying && <SpotifyIcon icon="play" />}
                </svg>
            </button>
        </div>
    )
};

export default NowPlayingIndicator;