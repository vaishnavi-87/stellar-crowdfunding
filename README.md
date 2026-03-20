# 🌟 Stellar Crowdfunding dApp — Yellow Belt Level 2

A crowdfunding dApp built on Stellar testnet using Soroban smart contracts. Users can connect multiple wallets, view campaign progress in real-time, and donate XLM. 

## 📸 Screenshot
![Wallet Options](Wallet.png)
## 📄 Deployed Contract Address
CADIYRCJNB677SKRWN5KGB5EUZ2YQWE5MM3WQ4SQELZEAXTPTBXEULMW

## 🔗 Transaction Hash (Contract Call)
36dde0d9b36e5310b22a87b33bcc08c26be4aa24ebf8814b88e87fc661793e4f

Verify on Stellar Explorer:
https://stellar.expert/explorer/testnet/tx/36dde0d9b36e5310b22a87b33bcc08c26be4aa24ebf8814b88e87fc661793e4f

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- Rust + Stellar CLI
- Freighter browser extension (set to Testnet)

### Run Frontend Locally
cd frontend
npm install
npm run dev
Open http://localhost:5173

### Build Contract
cd contract
cargo build --target wasm32v1-none --release

### Deploy Contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/crowdfunding.wasm \
  --source alice \
  --network testnet

## ✅ Features
- Multi-wallet support (Freighter, xBull, Rabet)
- Real-time donation progress updates
- 3 error types handled
- Transaction status with explorer link
- Auto-closes campaign when goal is reached
