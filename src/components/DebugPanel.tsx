import React from "react";
import { useFilterContext } from "../context/context";

const DebugPanel = () => {
	const filterState = useFilterContext();

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