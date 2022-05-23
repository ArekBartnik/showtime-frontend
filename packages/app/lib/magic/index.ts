import { Magic } from "@magic-sdk/react-native";

const isMumbai = process.env.NEXT_PUBLIC_CHAIN_ID === "mumbai";

// Default to polygon chain
const customNodeOptions = {
  rpcUrl: process.env.NEXT_PUBLIC_ALCHEMY_MAINNET,
  chainId: 137,
};

if (isMumbai) {
  console.log("Magic network is connecting to Mumbai testnet");
  customNodeOptions.rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI;
  customNodeOptions.chainId = 80001;
}

const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUB_KEY, {
  network: customNodeOptions,
});

const Relayer = magic.Relayer;

export { magic, Magic, Relayer };
