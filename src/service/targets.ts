import { getTargetAllocations } from "src/providers/Candle"
import { getOrSave } from "./cache"
import { MINUTE } from "src/utils/TIME"

export default async function targets() {
  return getOrSave("target-allocations", getTargetAllocations, 10 * MINUTE)
}
