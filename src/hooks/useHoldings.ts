import useSWR from "swr"
import { Tokens } from "src/service/Data"
import { fetcher } from "src/utils/fetcher"
import { HoldingsApi } from "src/service/holdings"

const initalToken = {
  value: NaN,
  units: NaN,
  hasError: false,
  token: "CANDLE" as Tokens,
  updated: 0,
}

const initalOtherToken = {
  value: NaN,
  units: NaN,
  hasError: false,
  token: "BTC",
  updated: 0,
} as const

const INITAL_DATA: HoldingsApi = {
  candle: {
    custody: initalToken,
    unfrozen: initalToken,
    frozen: initalToken,
  },
  otherAssets: [
    initalOtherToken,
    { ...initalOtherToken, token: "ETH" },
    { ...initalOtherToken, token: "DAI" },
  ],
}

export default function useHoldings(): { data: HoldingsApi; error: any } {
  const candleHoldings = useSWR<Pick<HoldingsApi, "candle">>("/api/holdings/candle", fetcher, {
    initialData: { candle: INITAL_DATA.candle },
    revalidateOnMount: true,
  })
  const otherHoldings = useSWR<Pick<HoldingsApi, "otherAssets">>("/api/holdings/other", fetcher, {
    initialData: { otherAssets: INITAL_DATA.otherAssets },
    revalidateOnMount: true,
  })
  const error = candleHoldings.error || otherHoldings.error
  const data: HoldingsApi = { ...candleHoldings.data, ...otherHoldings.data }
  return { data, error }
}
