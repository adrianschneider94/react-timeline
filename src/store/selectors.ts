import {StoreShape, TimelineEvent} from './shape'
import {createSelector} from 'reselect'
import {areIntervalsIntersecting} from 'schedule-fns/lib/src/functions/intervals'
import {PureInterval} from './reducers/events'
import {BusinessLogic} from './businessLogic'
import {getDefaultTimeZone} from "../index"
import {IntervalCreator} from "../functions"
import {compareAsc} from "date-fns"


export type TimelineSelector<T> = (config: BusinessLogic) => (state: StoreShape) => T

function distributeEventsVertically(events: Record<string, PureInterval>): Record<string, number> {
    let positionedEvents: Record<string, { interval: PureInterval, position: number }> = {}
    for (const [key, interval] of Object.entries(events).sort(([_, evtA], [__, evtB]) => compareAsc(evtA.start, evtB.start))) {
        let positions = Object.values(positionedEvents).filter(
            (leftEvent) => areIntervalsIntersecting(leftEvent.interval, interval) && leftEvent.interval.end !== interval.start && leftEvent.interval.start !== interval.end,
        ).map((leftEvent) => leftEvent.position)
        let position = 0
        while (positions.includes(position)) {
            position++
        }
        positionedEvents = {...positionedEvents, [key]: {interval, position}}
    }
    return Object.fromEntries(Object.entries(positionedEvents).map(([key, data]) => [key, data.position]))
}

export const eventSelector = (_: BusinessLogic) => (state: StoreShape) => state.events
export const selectStartDate = (_: BusinessLogic) => (state: StoreShape) => state.timeScale.startDate
export const selectEndDate = (_: BusinessLogic) => (state: StoreShape) => state.timeScale.startDate.valueOf() + state.size.width * state.timeScale.timePerPixel
export const selectTimeZone = (_: BusinessLogic) => (state: StoreShape) => state.timeZone
export const selectWeekStartsOn = (_: BusinessLogic) => (state: StoreShape) => state.weekStartsOn
export const selectAnimate = (_: BusinessLogic) => (state: StoreShape) => state.animate
export const selectEvents = (_: BusinessLogic) => (state: StoreShape) => state.events
export const selectInterval = (id: string) => (_: BusinessLogic) => (state: StoreShape) => state.events?.[id].volatileState?.interval || state.events?.[id].interval
export const selectInitialized = (_: BusinessLogic) => (state: StoreShape) => state.initialized
export const selectSize = (_: BusinessLogic) => (state: StoreShape) => state.size
export const selectSpringConfig = (_: BusinessLogic) => (state: StoreShape) => state.springConfig
export const selectDateZero = (_: BusinessLogic) => (state: StoreShape) => state.timeScale.dateZero
export const selectTimePerPixel = (_: BusinessLogic) => (state: StoreShape) => state.timeScale.timePerPixel
export const selectZoomCenter = (_: BusinessLogic) => (state: StoreShape) => state.timeScale.zoomCenter


// Returns [groupId1, groupId2, ...]
export const getGroupIdsFromEvents = (config: BusinessLogic) => createSelector(
    [eventSelector(config)],
    events => {
        return Array.from(new Set(Object.values(config.mapEventsToGroups(events)))) as string[]
    },
)

// Returns {eventId1: groupId1, eventId2: groupId2, ...}
export const getEventIdToGroupIdMap = (config: BusinessLogic) => createSelector(
    [eventSelector(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).map(([id, event]) => [id, event.groupId])) as Record<string, string>
    },
)

// Returns {groupId1: [eventId1, eventId2], groupId2: [eventId3], ...}
export const getGroupsAndEventIds = (config: BusinessLogic) => createSelector(
    [getGroupIdsFromEvents(config), getEventIdToGroupIdMap(config)],
    (groups, eventIdToGroupMap) => {
        return Object.fromEntries(
            groups.map(
                (groupId) => [
                    groupId,
                    Object.entries(eventIdToGroupMap)
                        .filter(([_, eventGroupId]) => eventGroupId === groupId)
                        .map(([eventId, _]) => eventId),
                ],
            ),
        ) as Record<string, string[]>
    },
)

// Returns {eventId1: interval1, eventId2: interval2, ...}
export const getEventIntervals = (config: BusinessLogic) => createSelector(
    [eventSelector(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).map(([id, event]) => [id, event.volatileState?.interval || event.interval])) as Record<string, PureInterval>
    },
)

// Returns {groupId1: {eventId1: interval1, eventId2: interval2}, groupId2: {eventId3: interval3}, ...}
export const selectGroupsAndEventIntervals = (config: BusinessLogic) => createSelector(
    [getGroupsAndEventIds(config), getEventIntervals(config)],
    (groupsAndEventIds, eventIntervals) => {
        return Object.fromEntries(
            Object.entries(groupsAndEventIds).map(
                ([groupId, eventIds]) => [
                    groupId,
                    Object.fromEntries(
                        eventIds.map((eventId) => [eventId, eventIntervals[eventId]]),
                    ),
                ],
            ),
        ) as Record<string, Record<string, PureInterval>>
    },
)

// Returns {groupId1: {eventId1: position1, eventId2: position2}, groupId2: {eventId3: position3}, ...}
export const selectGroupsAndEventPositions = (config: BusinessLogic) => createSelector(
    [selectGroupsAndEventIntervals(config)],
    (groupsAndEventIntervals) => {
        return Object.fromEntries(Object.entries(groupsAndEventIntervals).map(
            ([groupId, eventIntervals]) => {
                return [groupId, distributeEventsVertically(eventIntervals)]
            }
        )) as Record<string, Record<string, number>>
    },
)

// Returns {eventId1: positionInGroup1, eventId2: positionInGroup2, ...}
export const selectEventPositionsInGroup = (config: BusinessLogic) => createSelector(
    [selectGroupsAndEventPositions(config)],
    (groupsAndEventPositions) => {
        return Object.entries(groupsAndEventPositions).reduce((aggregate, [_, eventPositions]) => ({...aggregate, ...eventPositions}), {}) as Record<string, number>
    }
)

// Returns {groupId1: height1, groupId2: height2, ...}
export const getGroupHeights = (config: BusinessLogic) => createSelector(
    [selectGroupsAndEventPositions(config)],
    (groupsAndEventPositions) => {
        return Object.fromEntries(Object.entries(groupsAndEventPositions).map(([groupId, eventPositions]) => [groupId, Math.max(...Object.entries(eventPositions).map(([_, position]) => position)) + 1]))
    },
)

// Returns {groupId1: offset1, groupId2: offset2, ...}
export const getGroupOffsets = (config: BusinessLogic) => createSelector(
    [getGroupHeights(config)],
    (groupHeights) => {
        return Object.entries(groupHeights).reduce<[Record<string, number>, number]>(
            (aggregate, [groupId, height]) => {
                let [groups, offset] = aggregate
                return [{
                    ...groups,
                    [groupId]: offset,
                }, offset + height]
            }, [{}, 0])[0]
    },
)

// Returns {groupId1: position1, groupId2: position2, ...}
export const selectGroupPositions = (config: BusinessLogic) => createSelector(
    [getGroupIdsFromEvents(config)],
    (groupIds) => {
        return Object.fromEntries(config.orderGroups({groupIds}).groupIds.map((groupId, index) => [groupId, index])) as Record<string, number>
    }
)

// Returns {event1: position1, event2: position2, ...}
export const getEventsInGroup = (groupId: string) => (config: BusinessLogic) => createSelector(
    [eventSelector(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).filter(([_, event]) => event.groupId === groupId).map(([key, event]) => [key, event])) as Record<string, TimelineEvent>
    },
)

// Returns {groupId1: {eventId1: event1, eventId2: event2}, ...}
export const getGroupsAndEvents = (config: BusinessLogic) => createSelector(
    getGroupIdsFromEvents(config),
    eventSelector(config),
    (groups, events) => {
        return Object.fromEntries(groups.map(groupId => [groupId, Object.fromEntries(Object.entries(events).filter(([_, event]) => event.groupId === groupId).map(([key, event]) => [key, event])) as Record<string, TimelineEvent>]))
    },
)

// Returns {eventId1: interval1, eventId2: interval2, ...}
export const getEventIntervalsInGroup = (groupId: string) => (config: BusinessLogic) => createSelector(
    [eventSelector(config)],
    (events) => {
        return Object.fromEntries(Object.entries(events).filter(([_, event]) => event.groupId === groupId).map(([key, event]) => [key, event.volatileState?.interval || event.interval])) as Record<string, PureInterval>
    },
)

// Returns [interval1, interval2, ...]
export const getHeaderIntervals = (intervalCreator: IntervalCreator, intervalLength: number) => (config: BusinessLogic) => createSelector(
    [selectStartDate(config), selectEndDate(config), selectTimeZone(config), selectWeekStartsOn(config)],
    (startDate, endDate, timeZone, weekStartsOn) => {
        let temporalWidth = (endDate.valueOf() - startDate.valueOf())

        let from = startDate.valueOf() - 0.5 * temporalWidth
        let to = endDate.valueOf() + 0.5 * temporalWidth

        let roundedFrom = Math.floor(from / (3 * intervalLength)) * 3 * intervalLength
        let roundedTo = Math.ceil(to / (3 * intervalLength)) * 3 * intervalLength

        return intervalCreator(roundedFrom, roundedTo, {
            timeZone: timeZone || getDefaultTimeZone(),
            weekStartsOn: weekStartsOn || 1,
        })
    }
)

// Returns {eventId1: position1, eventId2: position2, ...}
export const selectPositionsInGroup = (groupId: string) => (config: BusinessLogic) => createSelector(
    [selectGroupsAndEventPositions(config)],
    (groupsAndEventPositions) => {
        return groupsAndEventPositions?.[groupId]
    },
)

// Returns [eventId1, eventId2, eventId3]
export const selectEventIds = (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    (events) => Object.keys(events)
)

// Returns [eventId1, eventId2, ...]
export const selectEventIdsOrderedByStartDate = (config: BusinessLogic) => createSelector(
    [getEventIntervals(config)],
    (events) => Object.entries(events).sort(([_, intervalA], [__, intervalB]) => compareAsc(intervalA.start, intervalB.start)).map(([eventId]) => eventId)
)

// Returns {eventId1: groupId1, eventId2: groupId2, ...}
export const selectEventIdsToGroup = (config: BusinessLogic) => createSelector(
    [selectEvents(config)],
    (events) => Object.fromEntries(Object.entries(events).map(([eventId, event]) => [eventId, event.groupId])) as Record<string, string>
)

