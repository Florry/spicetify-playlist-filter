import React from "react";
import { useConfigContext, useFilterContext } from "../context/context";

const DebugPanel = () => {
	const { library, playlists, ...filterState } = useFilterContext();
	const config = useConfigContext();

	return (
		<pre style={{
			position: "absolute", left: 573,
			background: "var(--background-base)"
		}}>
			{JSON.stringify(filterState, null, 2)}
		</pre>
	);
};

export default DebugPanel;