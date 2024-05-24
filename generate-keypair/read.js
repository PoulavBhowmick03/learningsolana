import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));
const address = new PublicKey('CHrCnTRbq3xKJ5qdSQHEbA2JxkNYUzUXzy9NPBd2mBxG');
const balance = await connection.getBalance(address);
const balanceInSol = balance / LAMPORTS_PER_SOL;

console.log(`The balance of the account at ${address} is ${balanceInSol} SOL`); 
console.log(`✅ Finished!`)

// // Import dotenv to load environment variables
// import 'dotenv/config';

// // Import the helper function
// import { getKeypairFromEnvironment } from '@solana-developers/helpers';

// // Load the keypair using the environment variable
// const keypair = getKeypairFromEnvironment("SECRET_KEY");

// console.log(`✅ Finished! We've loaded our secret key securely, using an env file!`);
// console.log(`Public Key: ${keypair.publicKey.toBase58()}`);
// // console.log(process.env);
