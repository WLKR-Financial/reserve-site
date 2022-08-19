import { getBTCBalance as getBlockChainBTCBalance } from "src/providers/BlockchainDotCom"
import getBlockStreamBTCBalance from "src/providers/Blockstream"
import {
  getFrozenBalance,
  getInCustodyBalance,
  getUnFrozenBalance,
  getcMC02Balance,
} from "src/providers/Candle"
import * as etherscan from "src/providers/Etherscan"
import * as ethplorer from "src/providers/Ethplorerer"
import duel, { Duel, sumMerge } from "./duel"
import getRates, { candlePrice } from "./rates"
import { getOrSave } from "src/service/cache"
import { MINUTE } from "src/utils/TIME"
import { TokenModel, Tokens } from "./Data"
import ProviderSource from "src/providers/ProviderSource"
import { Token } from "@celo/contractkit"
import addressesConfig from "src/addresses.config"

export async function getGroupedNonCeloAddresses() {
  const groupedByToken = addressesConfig.reduce((groups, current) => {
    groups[current.token] = current.addresses
    return groups
  }, {})
  return groupedByToken as Record<Tokens, string[]>
}

async function fetchBTCBalance() {
  return getSumBalance("BTC", (address) => {
    return duel(getBlockChainBTCBalance(address), getBlockStreamBTCBalance(address))
  })
}

async function getSumBalance(token: Tokens, balanceFetcher: (address: string) => Promise<Duel>) {
  const addresses = await getGroupedNonCeloAddresses()
  const balances = await Promise.all(addresses[token].map(balanceFetcher))
  return balances.reduce(sumMerge)
}

export async function btcBalance() {
  return getOrSave<Duel>("btc-balance", fetchBTCBalance, 10 * MINUTE)
}

async function fetchETHBalance() {
  return getSumBalance("ETH", (address) => {
    return duel(etherscan.getETHBalance(address), ethplorer.getETHBalance(address))
  })
}

export async function ethBalance() {
  return getOrSave<Duel>("eth-balance", fetchETHBalance, 10 * MINUTE)
}

function fetchERC20OnEthereumBalance(token: Tokens) {
  const tokenOnEthereum = addressesConfig.find((coin) => coin.token === token)
  return getSumBalance(token, (address) => {
    return duel(
      etherscan.getERC20onEthereumMainnetBalance(
        tokenOnEthereum.tokenAddress,
        address,
        tokenOnEthereum.decimals
      ),
      ethplorer.getERC20OnEthereumBalance(tokenOnEthereum.tokenAddress, address)
    )
  })
}

export async function erc20OnEthereumBalance(token: Tokens) {
  return getOrSave<Duel>(`${token}-balance`, () => fetchERC20OnEthereumBalance(token), 10 * MINUTE)
}

export async function candleCustodiedBalance() {
  return getOrSave<ProviderSource>("candle-custody-balance", getInCustodyBalance, 5 * MINUTE)
}

export async function cMC02Balance() {
  return getOrSave<ProviderSource>("cmc02-balance", getcMC02Balance, 10 * MINUTE)
}

export async function candleFrozenBalance() {
  return getOrSave<ProviderSource>("candle-frozen-balance", getFrozenBalance, 5 * MINUTE)
}

export async function candleUnfrozenBalance() {
  return getOrSave<ProviderSource>("candle-unfrozen-balance", getUnFrozenBalance, 2 * MINUTE)
}

export interface HoldingsApi {
  candle: {
    unfrozen: TokenModel
    frozen: TokenModel
    custody: TokenModel
  }
  otherAssets: TokenModel[]
}

export async function getHoldingsCandle() {
  const [candleRate, candleCustodied, frozen, unfrozen] = await Promise.all([
    candlePrice(),
    candleCustodiedBalance(),
    candleFrozenBalance(),
    candleUnfrozenBalance(),
  ])

  return { candle: toCandleShape(frozen, candleRate, unfrozen, candleCustodied) }
}

function toCandleShape(
  frozen: ProviderSource,
  candleRate: Duel,
  unfrozen: ProviderSource,
  candleCustodied: ProviderSource
) {
  return {
    frozen: {
      token: Token.CANDLE,
      units: frozen.value,
      value: frozen.value * candleRate.value,
      hasError: frozen.hasError,
      updated: frozen.time,
    },
    unfrozen: {
      token: Token.CANDLE,
      units: unfrozen.value,
      value: unfrozen.value * candleRate.value,
      hasError: unfrozen.hasError,
      updated: unfrozen.time,
    },
    custody: {
      token: Token.CANDLE,
      units: candleCustodied.value,
      value: candleCustodied.value * candleRate.value,
      hasError: candleCustodied.hasError,
      updated: candleCustodied.time,
    },
  } as const
}

export async function getHoldingsOther() {
  try {
    const [rates, btcHeld, ethHeld, daiHeld, usdcHeld, cmco2Held] = await Promise.all([
      getRates(),
      btcBalance(),
      ethBalance(),
      erc20OnEthereumBalance("DAI"),
      erc20OnEthereumBalance("USDC"),
      cMC02Balance(),
    ])

    const otherAssets: TokenModel[] = [
      toToken("BTC", btcHeld, rates.btc),
      toToken("ETH", ethHeld, rates.eth),
      toToken("DAI", daiHeld),
      toToken("USDC", usdcHeld),
      toToken("cMCO2", cmco2Held, rates.cmco2),
    ]

    return { otherAssets }
  } catch (e) {
    console.error(e)
  }
}

export default async function getHoldings(): Promise<HoldingsApi> {
  const [rates, btcHeld, ethHeld, daiHeld, usdcHeld, candleCustodied, frozen, unfrozen, cmco2Held] =
    await Promise.all([
      getRates(),
      btcBalance(),
      ethBalance(),
      erc20OnEthereumBalance("DAI"),
      erc20OnEthereumBalance("USDC"),
      candleCustodiedBalance(),
      candleFrozenBalance(),
      candleUnfrozenBalance(),
      cMC02Balance(),
    ])

  const otherAssets: TokenModel[] = [
    toToken("BTC", btcHeld, rates.btc),
    toToken("ETH", ethHeld, rates.eth),
    toToken("DAI", daiHeld),
    toToken("USDC", usdcHeld),
    toToken("cMCO2", cmco2Held, rates.cmco2),
  ]

  return {
    candle: toCandleShape(frozen, rates.candle, unfrozen, candleCustodied),
    otherAssets,
  }
}

function toToken(label: Tokens, tokenData: Duel | ProviderSource, rate?: Duel): TokenModel {
  return {
    token: label,
    units: tokenData.value,
    value: (tokenData.value || 0) * (rate?.value || 1),
    hasError: !tokenData.value,
    updated: tokenData.time,
  }
}
