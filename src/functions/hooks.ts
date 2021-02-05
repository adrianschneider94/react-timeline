import {RefObject, useEffect, useRef, useState} from 'react'

type Size = {x: number, y: number, width: number, height: number}
export const useResizeObserver = <E extends SVGElement | HTMLElement, >(ref: RefObject<E>) => {
    let [size, setSize] = useState<Size>({x: 0, y: 0, width: 0, height: 0})
    let observer = useRef(new ResizeObserver(entries => {
        let firstEntry = entries[0]
        try {
            let bbox = (firstEntry.target as SVGGeometryElement).getBBox()
            setSize(() => ({
                x: bbox.x,
                y: bbox.y,
                width: bbox.width,
                height: bbox.height,
            }))
        } catch {
            let bbox = firstEntry.target.getBoundingClientRect()
            setSize(() => ({
                x: bbox.x,
                y: bbox.y,
                width: bbox.width,
                height: bbox.height,
            }))
        }
    }))

    useEffect(() => {
        if (ref?.current) {
            observer.current.observe(ref.current)
        }
        return () => {
            observer.current.disconnect()
        }
    }, [ref])

    return size
}
