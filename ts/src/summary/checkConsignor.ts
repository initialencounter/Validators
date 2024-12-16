import { CheckResult } from "../shared/types/index"

export function checkConsignor(systemIdConsignor: string, summaryConsignor: string): CheckResult[] {
  if (!summaryConsignor.includes(systemIdConsignor.trim())) {
    return [{ ok: false, result: `委托方不一致, 系统上委托方为${systemIdConsignor.trim()}, 概要委托方为${summaryConsignor}` }]
  }
  return []
}