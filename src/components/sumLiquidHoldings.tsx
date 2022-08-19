import { HoldingsApi } from "src/service/holdings"
import { sumNonCandle } from "./Holdings"

export function sumLiquidHoldings(holdings: HoldingsApi) {
  const { custody, unfrozen } = holdings.candle
  const candleTotal = custody.value + unfrozen.value
  return candleTotal + sumNonCandle(holdings)
}
