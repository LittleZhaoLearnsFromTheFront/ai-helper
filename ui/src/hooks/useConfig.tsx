import { createContext, useContext, type FC } from "react";
import type { Session } from "../types";

type Config = {
    activeSession?: Session
    setActiveSession?: (session?: Session) => void
}

const ConfigContext = createContext<Config>({})

export const useConfig = () => {
    return useContext(ConfigContext)
}

export const ConfigProvider: FC<{
    children: React.ReactNode
} & Config> = ({ children, ...config }) => {
    return <ConfigContext.Provider value={config}> {children} </ConfigContext.Provider>
}