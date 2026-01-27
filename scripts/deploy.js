require("dotenv").config();
const hre = require("hardhat");

async function main() {
  // Conectar ao provider configurado
  const provider = new hre.ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
  const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("💼 Deploy feito por:", wallet.address);

  const DocCert = await hre.ethers.getContractFactory("DocumentCertification", wallet);
  const contract = await DocCert.deploy();

  await contract.waitForDeployment();
  console.log("🎉 Contrato deployado em:", contract.target);
  console.log("\n📝 Atualize o .env com:");
  console.log(`CONTRACT_ADDRESS=${contract.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
