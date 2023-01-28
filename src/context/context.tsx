import { createContext, useContext } from "react";
import { ConfigState, FilterState } from "../constants/constants";

export const FilterContext = createContext({} as FilterState);

export const useFilterContext = () => useContext(FilterContext);

export const ConfigContext = createContext({} as ConfigState);

export const useConfigContext = () => useContext(ConfigContext);