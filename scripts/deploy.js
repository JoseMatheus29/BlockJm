require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("💼 Deploy feito por:", deployer.address);

  const DocCert = await hre.ethers.getContractFactory("DocumentCertification");
  const contract = await DocCert.deploy();

  await contract.waitForDeployment();

  console.log("🎉 Contrato deployado em:", contract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
