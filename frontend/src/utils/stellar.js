import * as StellarSdk from "@stellar/stellar-sdk";
import * as StellarSdkMin from "@stellar/stellar-sdk/minimal";
import * as SorobanRpc from "@stellar/stellar-sdk/rpc";

export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const RPC_URL = "https://soroban-testnet.stellar.org";

export const CONTRACT_ID = "CADIYRCJNB677SKRWN5KGB5EUZ2YQWE5MM3WQ4SQELZEAXTPTBXEULMW";

export const rpc = new SorobanRpc.Server(RPC_URL);

export function stroopsToXLM(stroops) {
  return (Number(stroops) / 10_000_000).toFixed(2);
}

export function xlmToStroops(xlm) {
  return BigInt(Math.round(Number(xlm) * 10_000_000));
}

export async function readContract(method, args = []) {
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const sourceAccount = await rpc.getAccount(
      "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN"
    );
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();

    const result = await rpc.simulateTransaction(tx);
    if (SorobanRpc.Api.isSimulationError(result)) {
      throw new Error(result.error);
    }
    return result.result?.retval;
  } catch (err) {
    throw new Error(`Read failed: ${err.message}`);
  }
}