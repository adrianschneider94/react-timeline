import {
    add,
    addHours,
    addMinutes,
    addQuarters,
    addYears,
    getYear,
    set,
    startOfMonth,
    startOfQuarter,
    startOfWeek,
    startOfYear
} from "date-fns"
import {format as dateFnsTzFormat, utcToZonedTime, zonedTimeToUtc} from "date-fns-tz"

function getStartOfDay(date: Date | number, timeZone: string) {
    let dayString = format(new Date(date), "yyyy-MM-dd", {timeZone: timeZone}) + "T00:00:00.000"
    return zonedTimeToUtc(dayString, timeZone)
}

export type intervalCreatorOptions = {
    timeZone: string,
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
}

export function generateMinuteIntervals(from: number | Date, to: number | Date, {}: intervalCreatorOptions) {
    let currentMinute = set(from, {milliseconds: 0, seconds: 0})
    let minutes: Date[] = [currentMinute]
    while (currentMinute.valueOf() <= to) {
        currentMinute = addMinutes(currentMinute, 1)
        minutes = [...minutes, currentMinute]
    }
    return minutes.slice(0, -1).map<Interval>((minute, index) => ({start: minute, end: minutes.slice(1)[index]}))
}

export function generateQuarterHourIntervals(from: number | Date, to: number | Date, {}: intervalCreatorOptions) {
    let currentQuarter = set(from, {milliseconds: 0, seconds: 0, minutes: 0})
    let hours: Date[] = [currentQuarter]
    while (currentQuarter.valueOf() <= to) {
        currentQuarter = addMinutes(currentQuarter, 15)
        hours = [...hours, currentQuarter]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}

export function generateHourIntervals(from: number | Date, to: number | Date, {}: intervalCreatorOptions) {
    let currentHour = set(from, {milliseconds: 0, seconds: 0, minutes: 0})
    let hours: Date[] = [currentHour]
    while (currentHour.valueOf() <= to) {
        currentHour = addHours(currentHour, 1)
        hours = [...hours, currentHour]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}

export function generateFourHourIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentHour = getStartOfDay(from, timeZone)
    let hours: Date[] = [currentHour]
    while (currentHour.valueOf() <= to) {
        currentHour = addHours(currentHour, 4)
        hours = [...hours, currentHour]
    }
    return hours.slice(0, -1).map<Interval>((hour, index) => ({start: hour, end: hours.slice(1)[index]}))
}

export function generateDayIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentDay = getStartOfDay(from, timeZone)
    let days: Date[] = [currentDay]
    while (currentDay.valueOf() <= to) {
        currentDay = getStartOfDay(addHours(currentDay, 36), timeZone)
        days = [...days, currentDay]
    }
    return days.slice(0, -1).map<Interval>((day, index) => ({start: day, end: days.slice(1)[index]}))
}

export function generateWeekIntervals(from: number | Date, to: number | Date, {
    timeZone,
    weekStartsOn
}: intervalCreatorOptions) {
    let currentWeek = getStartOfDay(startOfWeek(from, {weekStartsOn}), timeZone)
    let weeks: (Date | number)[] = [currentWeek]
    while (currentWeek.valueOf() <= to) {
        currentWeek = getStartOfDay(add(currentWeek, {days: 7, hours: 12}), timeZone)
        weeks = [...weeks, currentWeek]
    }
    return weeks.slice(0, -1).map<Interval>((week, index) => ({start: week, end: weeks.slice(1)[index]}))
}

export function generateMonthIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentMonth = getStartOfDay(startOfMonth(from), timeZone)
    let months: (Date | number)[] = [currentMonth]
    while (currentMonth.valueOf() <= to) {
        currentMonth = getStartOfDay(add(currentMonth, {months: 1}), timeZone)
        months = [...months, currentMonth]
    }
    return months.slice(0, -1).map<Interval>((week, index) => ({start: week, end: months.slice(1)[index]}))
}

export function generateQuarterIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentQuarter = getStartOfDay(startOfQuarter(from), timeZone)
    let quarters: (Date | number)[] = [currentQuarter]
    while (currentQuarter.valueOf() <= to) {
        currentQuarter = getStartOfDay(addQuarters(currentQuarter, 1), timeZone)
        quarters = [...quarters, currentQuarter]
    }
    return quarters.slice(0, -1).map<Interval>((week, index) => ({start: week, end: quarters.slice(1)[index]}))
}

export function generateYearIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentYear = getStartOfDay(startOfYear(from), timeZone)
    let years: (Date | number)[] = [currentYear]
    while (currentYear.valueOf() <= to) {
        currentYear = getStartOfDay(addYears(currentYear, 1), timeZone)
        years = [...years, currentYear]
    }
    return years.slice(0, -1).map<Interval>((week, index) => ({start: week, end: years.slice(1)[index]}))
}

export function generateDecadeIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentDecade = getStartOfDay(startOfYear(set(from, {year: Math.floor(getYear(from) / 10) * 10})), timeZone)
    let decades: (Date | number)[] = [currentDecade]
    while (currentDecade.valueOf() <= to) {
        currentDecade = getStartOfDay(addYears(currentDecade, 10), timeZone)
        decades = [...decades, currentDecade]
    }
    return decades.slice(0, -1).map<Interval>((week, index) => ({start: week, end: decades.slice(1)[index]}))
}

export function generateCenturyIntervals(from: number | Date, to: number | Date, {timeZone}: intervalCreatorOptions) {
    let currentCentury = getStartOfDay(startOfYear(set(from, {year: Math.floor(getYear(from) / 100) * 100})), timeZone)
    let century: (Date | number)[] = [currentCentury]
    while (currentCentury.valueOf() <= to) {
        currentCentury = getStartOfDay(addYears(currentCentury, 100), timeZone)
        century = [...century, currentCentury]
    }
    return century.slice(0, -1).map<Interval>((week, index) => ({start: week, end: century.slice(1)[index]}))
}

export function format(date: Date | number, formatString: string, {timeZone}: { timeZone: string }) {
    return dateFnsTzFormat(utcToZonedTime(new Date(date), timeZone), formatString, {timeZone})
}