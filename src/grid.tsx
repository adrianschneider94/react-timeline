import React, {useContext, useEffect, useState} from "react"
import {animated, useSpring} from "react-spring"
import {v4 as uuidv4} from 'uuid'
import {TimelineContext} from "./definitions"

export type GridProps = {
    startDate: Date | number
    interval: Date | number
}

export const Grid: React.FC<GridProps> = ({startDate, interval, ...props}) => {
    let {timePerPixel, dateZero: canvasInitialStartDate, startDate: canvasStartDate, springConfig, initialized} = useContext(TimelineContext)
    if (initialized) {
        let [id, setId] = useState<string>("")

        useEffect(() => {
            setId(uuidv4())
        }, [])

        let {x, width} = useSpring({
            x: (canvasStartDate.valueOf() - canvasInitialStartDate.valueOf()) / timePerPixel,
            width: interval.valueOf() / timePerPixel.valueOf(),
            config: springConfig
        })
        let d = width.to(width => "M 0 0 L 0 " + width.toString() + " 0 0")
        return <>
            <animated.pattern id={id} width={width} height="1" x={(startDate.valueOf() - canvasInitialStartDate.valueOf()) / timePerPixel.valueOf()} patternUnits="userSpaceOnUse">
                <animated.path d={d}
                               shapeRendering="crispEdges" {...{stroke: "gray", strokeWidth: 1, ...props}} />
            </animated.pattern>
            <animated.rect x={x} y={0} width={"100%"}
                           height={"100%"} fill={"url(#" + id + ")"}/>
        </>
    } else {
        return <></>
    }
}
