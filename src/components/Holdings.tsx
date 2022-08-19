import { css } from "@emotion/react"
import Amount, { DollarDisplay } from "src/components/Amount"
import Heading from "src/components/Heading"
import { BreakPoints } from "src/components/styles"
import PieChart, { ChartData } from "src/components/PieChart"
import { HoldingsApi } from "src/service/holdings"
import Head from "next/head"
import { skipZeros } from "src/utils/skipZeros"
import { Updated } from "src/components/Updated"
import Section from "src/components/Section"
import { sumTotalHoldings } from "./sumTotalHoldings"
import useHoldings from "src/hooks/useHoldings"

export function sumCandleTotal(holdings: HoldingsApi) {
  const { custody, frozen, unfrozen } = holdings.candle
  return custody.value + unfrozen.value + frozen.value
}

export function sumNonCandle({ otherAssets }: HoldingsApi) {
  return otherAssets.reduce((prev, current) => current.value + prev, 0)
}

function getPercents(holdings: HoldingsApi): ChartData[] {
  const candleTotal = sumCandleTotal(holdings)
  const total = candleTotal + sumNonCandle(holdings)

  function toPercent(value: number) {
    return (value / total) * 100
  }

  return [{ token: "CANDLE", percent: toPercent(candleTotal) }].concat(
    holdings.otherAssets.map((asset) => {
      return {
        token: asset.token,
        percent: toPercent(asset.value),
      }
    })
  )
}

function findOldestValueUpdatedAt(data?: HoldingsApi): number {
  if (!data) {
    return 0
  }

  return Math.min(
    ...data.otherAssets
      .map((token) => token.updated)
      .concat([data.candle.custody.updated, data.candle.frozen.updated, data.candle.unfrozen.updated])
  )
}

export default function Holdings() {
  const { data } = useHoldings()
  const percentages = getPercents(data)
  const isLoadingCandle = data.candle.frozen.updated === 0 || data.candle.unfrozen.updated === 0
  const isLoadingOther = !data.otherAssets.findIndex((coin) => coin.updated === 0)
  const oldestUpdate = findOldestValueUpdatedAt(data)
  const candle = data.candle

  return (
    <>
      <Head>
        <link rel="preload" href="/api/holdings/candle" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/holdings/other" as="fetch" crossOrigin="anonymous" />
      </Head>
      <Section
        title={"Current Reserve Holdings"}
        subHeading={
          <>
            <DollarDisplay
              loading={isLoadingCandle || isLoadingOther}
              label="Liquidity"
              value={sumTotalHoldings(data)}
            />
            <Updated date={oldestUpdate} />
          </>
        }
      >
        <div css={rootStyle}>
          <Heading title="Candle Assets" gridArea="candle" />
          {candle.frozen.value > 0 ? (
            <Amount
              iconSrc={"/assets/tokens/CANDLE.svg"}
              context="Funds frozen in on-chain Reserve contract"
              loading={isLoadingCandle}
              label="Frozen"
              units={candle.frozen.units}
              value={candle.frozen.value}
              gridArea="frozen"
            />
          ) : (
            <div css={hiddenCandle}></div>
          )}

          <Amount
            iconSrc={"/assets/tokens/CANDLE.svg"}
            context="Funds in on-chain Reserve contract and in custody"
            loading={isLoadingCandle}
            label={candle.frozen.value > 0 ? "Unfrozen" : "CANDLE"}
            units={candle.unfrozen.units + candle.custody.units}
            value={candle.unfrozen.value + candle.custody.value}
            gridArea="unfrozen"
          />

          <Heading title="Non-Candle Crypto Assets" gridArea="crypto" marginTop={30} />
          {data?.otherAssets?.filter(skipZeros)?.map((asset) => (
            <Amount
              key={asset.token}
              loading={isLoadingOther}
              label={asset.token}
              units={asset.units}
              value={asset.value}
              gridArea={""}
            />
          ))}
        </div>
        <PieChart
          label={"Current Composition"}
          slices={percentages}
          isLoading={isLoadingCandle || isLoadingOther}
        />
      </Section>
    </>
  )
}

const rootStyle = css({
  display: "grid",
  gridColumnGap: 20,
  gridRowGap: 12,
  gridAutoColumns: "1fr 1fr 1fr",
  gridTemplateAreas: `"candle candle candle"
                    "unfrozen unfrozen frozen"
                    "crypto crypto crypto"
                    "btc eth dai"
                    `,
  [BreakPoints.tablet]: {
    gridAutoColumns: "1fr",
    gridTemplateAreas: `"candle"
                        "unfrozen"
                        "frozen"
                        "crypto"
                        "btc"
                        "eth"
                        "dai"`,
  },
})

const hiddenCelo = css({
  visibility: "hidden",
  margin: 50,
})
