export enum Providers {
  coinbase = "coinbase",
  coinmarketcap = "coinmarketcap",
  blockstream = "blockstream",
  blockchainDotCom = "blockchain.com",
  etherscan = "etherscan",
  ethplorer = "ethplorer",
  forno = "forno.candle.org",
  ecb = "ecb.europa.eu",
  exchangeRates = "exchangeratesapi.io",
  ubeswap = "ubeswap",
}

export default interface ProviderSource<T = number> {
  value: T
  source: Providers
  time: number
  hasError: boolean
}

export function errorResult(error: any, source: Providers, value = 0) {
  console.info("ERROR", source, error)
  return { hasError: true as const, source, value, time: 0 }
}
