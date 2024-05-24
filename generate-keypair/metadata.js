import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const user = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

console.log(
  `🔑 We've loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "HaQRwzai15hyeaJ4ye5Eb5ZCbN92khpdWEdmsbB3iBk8"
);

// Substitute in your token mint account
const tokenMintAccount = new PublicKey("CHrCnTRbq3xKJ5qdSQHEbA2JxkNYUzUXzy9NPBd2mBxG");

const metadataData = {
  name: "Solana Training Token",
  symbol: "TRAINING",
  uri: "https://arweave.net/1234", // Ensure this URL points to valid JSON metadata
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

const [metadataPDA] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
);

const transaction = new Transaction();

const computeUnitsIx = ComputeBudgetProgram.requestUnits({
  units: 200000,
  additionalFee: 0,
});

transaction.add(computeUnitsIx);

const createMetadataAccountInstruction =
  createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: user.publicKey,
      payer: user.publicKey,
      updateAuthority: user.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    }
  );

transaction.add(createMetadataAccountInstruction);

async function simulateTransaction(connection, transaction, signers) {
  const { value: simulationResult } = await connection.simulateTransaction(transaction, signers);
  if (simulationResult.err) {
    console.error("Simulation failed:", simulationResult.err);
    console.error("Logs:", simulationResult.logs);
    throw new Error("Transaction simulation failed");
  }
  return simulationResult;
}

try {
  await simulateTransaction(connection, transaction, [user]);
  console.log("Transaction simulation succeeded.");

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [user]
  );

  const transactionLink = getExplorerLink(
    "transaction",
    transactionSignature,
    "devnet"
  );

  console.log(`✅ Transaction confirmed, explorer link is: ${transactionLink}!`);

  const tokenMintLink = getExplorerLink(
    "address",
    tokenMintAccount.toString(),
    "devnet"
  );

  console.log(`✅ Look at the token mint again: ${tokenMintLink}!`);
} catch (sendError) {
  console.error("Error sending transaction:", sendError);
  throw sendError;
}
