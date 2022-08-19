export type AssetTypes =
  | "stable-value"
  | "natural-capital"
  | "other-crypto-assets"
  | "candle-native-asset"

interface Allocation {
  percent: number
  token: string
  type: AssetTypes
}

export default Allocation
