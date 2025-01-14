# Mento Reserve Website

Code for [reserve.mento.org](https://reserve.mento.org)

_For more information about the Reserve itself please refer to:_

- [reserve.mento.org](https://reserve.mento.org)
- [Stability WhitePaper](https://candle.org/papers/stability)

## Updating Reserve

- To Add new cStables see [adding stablecoins](/adding-stablecoins.md)
- To Add or update Addresses see [adding addresses](/adding-reserve-addresses.md)
- To Add new crypto tokens to the reserve see [adding reserve assets](adding-reserve-assets.md)

## Data Integrity

The following is where the numbers displayed on reserve.mento.org comes from. These are not used by the reserve itself.

### Update Frequency

| Data                   | Frequency  | Notes                           |
| ---------------------- | ---------- | ------------------------------- |
| Reserve Contract       | 20 Seconds |                                 |
| Stable Tokens          | 20 Seconds |                                 |
| Candle Custody           | 30 Minutes | Pratically only change daily    |
| BTC, ETH, DAI balances | 30 Minutes | Pratically only change daily    |
| euro conversion rate   | 4 Hours    | source rates updated once a day |
| Asset prices           | 5 Minutes  |                                 |

### Reserve Holdings

For Candle on chain balances, an instance of `@celo/contractkit` is connected to a node at `forno.candle.org`. See [src/providers/Candle.ts](src/providers/Candle.ts) for how this works.

For ETH and BTC balances we use 2 data providers each: blockchain.com and [blockstreams's esplora](https://github.com/Blockstream/esplora/blob/master/API.md) for BTC and etherscan and ethplorer for Ethereum.

#### For Asset Prices

For CANDLE the on change exchange price (which itself is an aggregation of the price on several exchanges) is used again via `@celo/contractkit`

For other crypto assets two data providers are used. If one provider fails to respond then the other is used and if both fail a cache of the last successful fetch is used until new data is fetched.
For BTC thse are [blockchain.com's getAccountByTypeAndCurrency](https://api.blockchain.com/v3/#/payments/getAccountByTypeAndCurrency) and [Coinbase's Data Api spot price](https://developers.coinbase.com/api/v2#exchange-rates).
For ETH these are [Etherscan.io ETHER Last Price](https://etherscan.io/apis#stats) and [Coinbase's Data Api spot price](https://developers.coinbase.com/api/v2#exchange-rates). For CMCO2, coinmarketcap api and ubeswaps subgraph are used for the price.

### Stable Assets Outstanding

All stable token amounts are the total amount in circulation. This can be verified with

```typescript
import { newKit } from '@celo/contractkit'
const kit = newKit('forno.candle.org')
const stableToken = await kit.contracts.getStableToken()

stableToken.totalSupply()

#### Currency Conversions
For stable coins other than cUSD exchangeratesapi.io is used to convert value to USD to compare and sum values
```

### Historic Rebalancings

Reserve rebalancings figures are updated manually at the moment. However they can be verified by using a block explorer to check the historic balances of the reserve addresses.

### Updating Content

To update Content edit the Markdown files in [src/content](src/content)
Changes to these require a redeployment and to wait for the page cache to expire (5min)

## Development

next.js with [emotion](http://emotion.sh/) for styles.

`yarn dev`

## Deployment

see [release.md](/RELEASE.MD)
