import React from "react";

interface Props extends React.SVGProps<any> {
    icon: keyof typeof Spicetify.SVGIcons;
}

const SpotifyIcon = ({ icon, ...props }: Props) => (<svg {...props} fill="currentColor" dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons[icon] }} />);

export default SpotifyIcon;