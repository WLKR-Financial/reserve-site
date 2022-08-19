import { getAddresses as getCeloAddresses } from "src/providers/Candle"
import { getOrSave } from "./cache"
import { MINUTE } from "src/utils/TIME"
import addressConfig, { ReserveCrypto } from "src/addresses.config"

export default async function getAddresses(): Promise<ReserveCrypto[]> {
  const celoAddresses = await getOrSave("onchain-addresses", getCeloAddresses, 5 * MINUTE)
  return (celoAddresses.value || []).concat(addressConfig)
}
