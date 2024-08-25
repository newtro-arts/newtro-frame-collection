/** @jsxImportSource frog/jsx */

import { Button, Frog, parseEther } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { zoraTimedSaleStrategyABI } from "@zoralabs/protocol-deployments";
import { Address, createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { createCollectorClient } from "@zoralabs/protocol-sdk";
import getTokenMetdata from "@/lib/ipfs/getTokenMetadata";
import getIpfsLink from "@/lib/ipfs/getIpfsLink";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  title: "Newtro Arts",
});

const collection = "0x765cee6ff107f2b8c20c71ac34ff38776fd39d3e" as Address;
const collectionPageUrl = `https://newtro-v2-git-test-newtros-projects.vercel.app/collect/arb:${collection}`;
const minter = "0x777777722D078c97c6ad07d9f36801e653E356Ae" as Address;

app.frame("/", (c) => {
  return c.res({
    image: getIpfsLink("ipfs://QmYqJ2sF7UrziJLWViZ7y9kpkvwpC3sjkodhtGDCyF7fGr"),
    action: "/finish",
    intents: [
      <Button action="/explore" value="1">
        Explore collection
      </Button>,
      <Button.Transaction target="/mint">Mint all</Button.Transaction>,
      <Button.Link href={`${collectionPageUrl}/1`}>newtro.xyz</Button.Link>,
    ],
  });
});

app.frame("/explore", async (c) => {
  const { buttonValue } = c;
  const numberButtonValue = parseInt(buttonValue || "1", 10);
  const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(),
  });
  const collectorClient = createCollectorClient({
    chainId: arbitrum.id,
    publicClient,
  });
  const { tokens } = await collectorClient.getTokensOfContract({
    tokenContract: collection,
  });
  const tokenCount = tokens.length;
  const prevToken = numberButtonValue > 1 ? numberButtonValue - 1 : tokenCount;
  const nextToken =
    numberButtonValue === tokenCount ? 1 : numberButtonValue + 1;
  const selectedToken = tokens[numberButtonValue - 1];
  const tokenUri = selectedToken.token.tokenURI;
  const metadata = await getTokenMetdata(tokenUri);
  return c.res({
    image: getIpfsLink(metadata.image),
    action: "/finish",
    intents: [
      <Button action="/explore" value={prevToken.toString()}>
        previous
      </Button>,
      <Button action="/explore" value={nextToken.toString()}>
        next
      </Button>,
      <Button.Transaction target={`/mint?tokenId=${numberButtonValue}`}>
        Mint
      </Button.Transaction>,
      <Button.Link href={`${collectionPageUrl}/${numberButtonValue}`}>
        newtro.xyz
      </Button.Link>,
    ],
  });
});

app.transaction("/mint", async (c) => {
  const { address, frameData } = c;
  const url = frameData?.url;
  const tokenId = url?.split("=")[1] || 1;
  const quantity = 1;
  // change this to your comment
  const comment = "ALEPH HACKATHON";
  const args = [
    address,
    quantity,
    collection,
    tokenId,
    address,
    comment,
  ] as any;
  const functionName = "mint";
  const value = parseEther("0.000111");
  return c.contract({
    abi: zoraTimedSaleStrategyABI,
    chainId: `eip155:${arbitrum.id}`,
    functionName,
    args,
    to: minter,
    value,
  });
});

app.frame("/finish", (c) => {
  const { transactionId } = c;
  return c.res({
    image: (
      <div style={{ color: "white", display: "flex", fontSize: 60 }}>
        Transaction ID: {transactionId}
      </div>
    ),
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
