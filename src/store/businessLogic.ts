import {compareAsc} from 'date-fns'
import {RequiredEventData, RequiredGroupData} from './shape'
import {makePureInterval} from "./reducers/events"

export type BusinessLogic<E extends RequiredEventData = RequiredEventData, _G extends RequiredGroupData = RequiredGroupData, EventProps extends {} = E> = {
    validateDuringDrag: (data: { manipulatedEventId: string, newIntervals: Record<string, Interval>, events: Record<string, E> }) => { events?: Record<string, E> }
    validateDuringResize: (data: { manipulatedEventId: string, newIntervals: Record<string, Interval>, events: Record<string, E> }) => { events?: Record<string, E> }
    validateAfterDrag: (data: { manipulatedEventId: string, newIntervals: Record<string, Interval>, events: Record<string, E> }) => Promise<{ events?: Record<string, E> }>
    validateAfterResize: (data: { manipulatedEventId: string, newIntervals: Record<string, Interval>, events: Record<string, E> }) => Promise<{ events?: Record<string, E> }>
    orderGroups: (data: { groupIds: string[] }) => { groupIds: string[] },
    orderEventsForPositioning: (data: Record<string, E>) => string[],
    mapEventsToLayer: (data: Record<string, E>) => Record<string, number>,
    mapEventsToProps: (data: Record<string, E>) => Record<string, EventProps>
    displayEventsInSameRow: (data: Record<string, E>) => string[][]
}

export const DefaultBusinessLogic: BusinessLogic = {
    validateDuringDrag: ({newIntervals, events}) => {
        let newEvents = Object.fromEntries(Object.entries(events).map(([eventId, event]) => {
            if (newIntervals[eventId]) {
                return [eventId, {...event, interval: makePureInterval(newIntervals[eventId])}]
            } else {
                return [eventId, event]
            }
        }))
        return {
            events: newEvents
        }
    },
    validateDuringResize: ({newIntervals, events}) => {
        let newEvents = Object.fromEntries(Object.entries(events).map(([eventId, event]) => {
            if (newIntervals[eventId]) {
                return [eventId, {...event, interval: makePureInterval(newIntervals[eventId])}]
            } else {
                return [eventId, event]
            }
        }))
        return {
            events: newEvents
        }
    },
    validateAfterDrag: async ({newIntervals, events}) => {
        let newEvents = Object.fromEntries(Object.entries(events).map(([eventId, event]) => {
            if (newIntervals[eventId]) {
                return [eventId, {...event, interval: makePureInterval(newIntervals[eventId])}]
            } else {
                return [eventId, event]
            }
        }))
        return {
            events: newEvents
        }
    },
    validateAfterResize: async ({newIntervals, events}) => {
        let newEvents = Object.fromEntries(Object.entries(events).map(([eventId, event]) => {
            if (newIntervals[eventId]) {
                return [eventId, {...event, interval: makePureInterval(newIntervals[eventId])}]
            } else {
                return [eventId, event]
            }
        }))
        return {
            events: newEvents
        }
    },
    orderGroups: ({groupIds}) => ({
        groupIds: groupIds.sort(),
    }),
    orderEventsForPositioning: data => {
        return Object.entries(data).sort(([_a, EventA], [_b, EventB]) => compareAsc(EventA.interval.start, EventB.interval.start)).map(([eventId]) => eventId)
    },
    mapEventsToLayer: data => {
        return Object.fromEntries(Object.keys(data).map((key, _) => [key, 0])) as Record<string, number>
    },
    mapEventsToProps: data => data,
    displayEventsInSameRow: _ => []
}
