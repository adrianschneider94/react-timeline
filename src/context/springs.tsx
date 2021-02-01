import React, {createContext, useContext} from "react"
import {SpringValue, useSpring} from "react-spring"
import {SpringConstant} from "../definitions"
import {useAnimate, useInitialized, useSize, useSpringConfig, useStartDate, useTimePerPixel} from "../store/hooks"

export const StartDateSpringContext = createContext<SpringValue<Date | number>>(SpringConstant())
export const TimePerPixelSpringContext = createContext<SpringValue<number>>(SpringConstant())


export const StartDateAnimationContext: React.FC = ({children}) => {
    let startDate = useStartDate()
    let width = useSize().width
    let animate = useAnimate()
    let initialized = useInitialized()
    let springConfig = useSpringConfig()

    let [{startDateSpring}] = useSpring({
        startDateSpring: startDate,
        immediate: !animate || !initialized,
        config: springConfig,
    }, [startDate, width])

    return <>
        <StartDateSpringContext.Provider value={startDateSpring}>
            {children}
        </StartDateSpringContext.Provider>
    </>
}

export const TimePerPixelAnimationContext: React.FC = ({children}) => {
    let timePerPixel = useTimePerPixel()
    let animate = useAnimate()
    let initialized = useInitialized()
    let springConfig = useSpringConfig()


    let [{timePerPixelSpring}] = useSpring({
        timePerPixelSpring: timePerPixel,
        immediate: !animate || !initialized,
        config: springConfig,
    }, [timePerPixel])

    return <>
        <TimePerPixelSpringContext.Provider value={timePerPixelSpring}>
            {children}
        </TimePerPixelSpringContext.Provider>
    </>
}


export const useStartDateSpring = () => {
    return useContext(StartDateSpringContext)
}

export const useTimePerPixelSpring = () => {
    return useContext(TimePerPixelSpringContext)
}