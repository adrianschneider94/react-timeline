import {PresentationalEventComponent} from '../components/event'
import React from 'react'

export const DefaultEventComponent: PresentationalEventComponent = (
    {
        x,
        y,
        width,
        height,
        dragHandle,
        dragStartHandle,
        dragEndHandle,
        selected,
    }) => {
    return <>
        <rect ref={dragHandle} fill={'gray'} height={height} style={{paintOrder: 'stroke'}} y={y} x={x}
              width={width} />
        <rect ref={dragStartHandle} fill={'rgba(0,0,0,0.1)'} y={y} height={height} x={x} width={10}
              style={{cursor: 'ew-resize'}} visibility={selected ? 'display' : 'hidden'} />
        <rect ref={dragEndHandle} fill={'rgba(0,0,0,0.1)'} y={y} height={height} x={x + width} width={10}
              style={{cursor: 'ew-resize'}}
              transform={'translate(-10, 0)'} visibility={selected ? 'display' : 'hidden'} />
    </>
}