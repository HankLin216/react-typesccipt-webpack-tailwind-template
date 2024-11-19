import type { ITimeRange } from '../types/time'

const splitTimeRange = (range: ITimeRange, size: number, unit: moment.DurationInputArg2): ITimeRange[] => {
  const ret: ITimeRange[] = []
  if (size <= 0) {
    return ret
  }

  const startDate = range.startAt.clone()
  while (!startDate.isAfter(range.endAt)) {
    const endDate = startDate.clone().add(size, unit)
    ret.push({
      startAt: startDate.clone(),
      endAt: endDate.isAfter(range.endAt) ? range.endAt : endDate,
    })

    // update
    startDate.add(size, unit)
  }

  return ret
}

export { splitTimeRange }
export type { ITimeRange }
