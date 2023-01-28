import React from "react";
import { SortOption } from "../constants/constants";
import { useConfigContext, useFilterContext } from "../context/context";
import { sortItems } from "../utils/utils";

const DebugPanel = () => {
	const { library, playlists, ...filterState } = useFilterContext();
	const config = useConfigContext();

	return (
		<pre style={{
			position: "absolute", left: 573,
			background: "var(--background-base)"
		}}>
			{JSON.stringify(config, null, 2)}
		</pre>
	);
};

export default DebugPanel;