/**
 * Script de teste para o endpoint POST /certification/certify
 * 
 * Uso: node scripts/testCertifyEndpoint.js [caminho-do-pdf]
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testCertifyEndpoint(pdfPath) {
  const BASE_URL = process.env.API_URL || 'http://localhost:3000';
  
  if (!pdfPath) {
    console.log('❌ Por favor, forneça o caminho para um arquivo PDF');
    console.log('Uso: node scripts/testCertifyEndpoint.js [caminho-do-pdf]');
    console.log('\nExemplo:');
    console.log('  node scripts/testCertifyEndpoint.js ./test.pdf');
    return;
  }

  // Verificar se o arquivo existe
  if (!fs.existsSync(pdfPath)) {
    console.log(`❌ Arquivo não encontrado: ${pdfPath}`);
    return;
  }

  // Verificar se é PDF
  if (!pdfPath.toLowerCase().endsWith('.pdf')) {
    console.log('❌ O arquivo deve ser um PDF');
    return;
  }

  console.log(`📄 Testando certificação do arquivo: ${pdfPath}\n`);

  try {
    // Criar FormData
    const formData = new FormData();
    formData.append('file', fs.createReadStream(pdfPath));

    const inicio = Date.now();

    // Fazer requisição POST
    const response = await axios.post(`${BASE_URL}/certification/certify`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const tempoTotal = Date.now() - inicio;

    console.log('✅ Certificação realizada com sucesso!\n');
    console.log(`Status: ${response.status}`);
    console.log(`Tempo total: ${tempoTotal}ms\n`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    const tempoTotal = Date.now() - inicio;
    
    console.log('❌ Erro ao certificar documento:\n');
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Tempo: ${tempoTotal}ms`);
      console.log('Erro:', error.response.data);
    } else if (error.request) {
      console.log('Erro: Não foi possível conectar ao servidor');
      console.log('Verifique se o servidor está rodando em', BASE_URL);
    } else {
      console.log('Erro:', error.message);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const pdfPath = process.argv[2];
  testCertifyEndpoint(pdfPath);
}

module.exports = { testCertifyEndpoint };


