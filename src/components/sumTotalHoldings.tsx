import { HoldingsApi } from "src/service/holdings"
import { sumCandleTotal, sumNonCandle } from "./Holdings"

export function sumTotalHoldings(holdings: HoldingsApi) {
  return sumCandleTotal(holdings) + sumNonCandle(holdings)
}
