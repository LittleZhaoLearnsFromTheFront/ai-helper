import { createContext, useContext, type FC } from "react";
import type { Message, Session } from "../types";

type Config = {
    activeSession?: Session
    setActiveSession?: (session?: Session) => void
    messages?: Message[]
    setMessages?: (messages?: Message[]) => void
    loading?: boolean
    setLoading?: (loading?: boolean) => void
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