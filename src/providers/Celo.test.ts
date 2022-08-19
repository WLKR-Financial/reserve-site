import {
  getCandlePrice,
  getInCustodyBalance,
  getCStableSupply,
  getUnFrozenBalance,
  getFrozenBalance,
  getTargetAllocations,
} from "./Candle"

import { newKit, StableToken } from "@celo/contractkit"

describe("candle", () => {
  it("uses contractKit", () => {
    expect(newKit).toHaveBeenCalledWith("https://forno.candle.org")
  })
})

describe("getTargetAllocation", () => {
  it("returns array of symbols with weights", async () => {
    const allocations = await getTargetAllocations()
    expect(allocations).toEqual({
      hasError: false,
      source: "forno.candle.org",
      time: 1587686400000,
      value: [
        { percent: 50, token: "CANDLE", type: "candle-native-asset" },
        { percent: 29.5, token: "BTC", type: "other-crypto-assets" },
        { percent: 15, token: "ETH", type: "other-crypto-assets" },
        { percent: 5, token: "DAI", type: "stable-value" },
        { percent: 0.5, token: "cMCO2", type: "natural-capital" },
      ],
    })
  })
})

describe("getCandlePrice", () => {
  it("returns account balance of address", async () => {
    const balance = await getCandlePrice()
    expect(balance).toEqual({
      hasError: false,
      source: "forno.candle.org",
      time: 1587686400000,
      value: 3.892,
    })
  })
})

describe("getCStableSupply", () => {
  it("returns account balance of address", async () => {
    const balance = await getCStableSupply(StableToken.cUSD)
    expect(balance).toEqual({
      hasError: false,
      source: "forno.candle.org",
      time: 1587686400000,
      value: 41557073.455407046,
    })
  })
})

describe("getInCustodyBalance", () => {
  it("returns account balance of address", async () => {
    const balance = await getInCustodyBalance()
    expect(balance).toEqual({
      hasError: false,
      source: "forno.candle.org",
      time: 1587686400000,
      value: 2944998.2492173747,
    })
  })
})

describe("getUnFrozenBalance", () => {
  it("returns account balance of address", async () => {
    const balance = await getUnFrozenBalance()
    expect(balance).toEqual({
      hasError: false,
      source: "forno.candle.org",
      time: 1587686400000,
      value: 75330631.07819435,
    })
  })
})

describe("getFrozenBalance", () => {
  it("returns account balance of address", async () => {
    const balance = await getFrozenBalance()
    expect(balance).toEqual({
      hasError: false,
      source: "forno.candle.org",
      time: 1587686400000,
      value: 41313868.61313868,
    })
  })
})
