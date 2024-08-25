/** @jsxImportSource frog/jsx */

import { Button, Frog, parseEther } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { zoraTimedSaleStrategyABI } from "@zoralabs/protocol-deployments";
import { Address } from "viem";
import { arbitrum } from "viem/chains";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  title: "Frog Frame",
});

const tokenCount = 11;

app.frame("/", (c) => {
  return c.res({
    image:
      "https://ipfs.decentralized-content.com/ipfs/QmXZ5weAZsNBbvno38KXY4HNu74AfSQTXP4dFybw18gJ1J",
    action: "/finish",
    intents: [
      <Button action="/explore" value="1">
        Explore collection
      </Button>,
      <Button.Transaction target="/mint">Mint all</Button.Transaction>,
      <Button.Link href="https://newtro.xyz">newtro.xyz</Button.Link>,
    ],
  });
});

app.frame("/explore", (c) => {
  const { buttonValue, status } = c;
  const numberButtonValue = parseInt(buttonValue || "1", 10);
  const prevToken = numberButtonValue > 1 ? numberButtonValue - 1 : tokenCount;
  const nextToken =
    numberButtonValue === tokenCount ? 1 : numberButtonValue + 1;
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            display: "flex",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          PAGINA DE EXPLORE - token #{buttonValue}
        </div>
      </div>
    ),
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
      <Button.Link href="https://newtro.xyz">newtro.xyz</Button.Link>,
    ],
  });
});

app.transaction("/mint", async (c) => {
  const { address, frameData } = c;
  const url = frameData?.url;
  const tokenId = url?.split("=")[1];
  console.log("SWEETS tokenIdNew", tokenId);
  const minter = "0x777777722D078c97c6ad07d9f36801e653E356Ae" as Address;
  const quantity = 1;
  // change this to your zora collection on base
  const collection = "0x765cee6ff107f2b8c20c71ac34ff38776fd39d3e" as Address;
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
