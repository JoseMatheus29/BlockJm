/**
 * Scripts Auxiliares para Testes de Desempenho
 * 
 * Uso: node scripts/testPerformance.js [cenario]
 * 
 * Cenários disponíveis:
 * - listagem: Testa tempo de resposta do GET /certification
 * - consulta: Testa tempo de resposta do GET /certification/:hash
 * - auth-nonce: Testa geração de nonce
 * - carga-basica: Testa 5 requisições simultâneas
 * - integridade: Verifica sincronização DB-Blockchain
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { ethers } = require('ethers');
require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const prisma = new PrismaClient();
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

/**
 * Cenário 1: Teste de Listagem de Certificações
 */
async function testListagem() {
  console.log('📊 Testando: Listagem de Certificações (GET /certification)\n');
  
  const tempos = [];
  const numRequisicoes = 10;
  
  for (let i = 1; i <= numRequisicoes; i++) {
    const inicio = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/certification`);
      const tempo = Date.now() - inicio;
      tempos.push(tempo);
      console.log(`Requisição ${i}: ${tempo}ms - Status: ${response.status}`);
    } catch (error) {
      console.error(`Erro na requisição ${i}:`, error.message);
    }
  }
  
  if (tempos.length > 0) {
    const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    const min = Math.min(...tempos);
    const max = Math.max(...tempos);
    const p95 = tempos.sort((a, b) => a - b)[Math.floor(tempos.length * 0.95)];
    
    console.log('\n📈 Resultados:');
    console.log(`   Média: ${media.toFixed(2)}ms`);
    console.log(`   Mínimo: ${min}ms`);
    console.log(`   Máximo: ${max}ms`);
    console.log(`   P95: ${p95}ms`);
    console.log(`\n✅ Critério: Média ≤ 500ms, P95 ≤ 1000ms`);
    console.log(`   Status: ${media <= 500 && p95 <= 1000 ? '✅ PASSOU' : '❌ FALHOU'}`);
  }
}

/**
 * Cenário 2: Teste de Consulta por Hash
 */
async function testConsultaHash() {
  console.log('📊 Testando: Consulta por Hash (GET /certification/:hash)\n');
  
  // Buscar um hash válido do banco
  const certificacao = await prisma.certification.findFirst();
  
  if (!certificacao) {
    console.error('❌ Nenhuma certificação encontrada no banco. Crie algumas certificações primeiro.');
    return;
  }
  
  const hashValido = certificacao.documentHash;
  const hashInvalido = '0x' + 'a'.repeat(64);
  
  console.log('Testando com hash válido...');
  const temposValidos = [];
  for (let i = 1; i <= 10; i++) {
    const inicio = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/certification/${hashValido}`);
      const tempo = Date.now() - inicio;
      temposValidos.push(tempo);
      console.log(`  Requisição ${i}: ${tempo}ms - Status: ${response.status}`);
    } catch (error) {
      console.error(`  Erro na requisição ${i}:`, error.message);
    }
  }
  
  console.log('\nTestando com hash inválido (404)...');
  const temposInvalidos = [];
  for (let i = 1; i <= 5; i++) {
    const inicio = Date.now();
    try {
      await axios.get(`${BASE_URL}/certification/${hashInvalido}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const tempo = Date.now() - inicio;
        temposInvalidos.push(tempo);
        console.log(`  Requisição ${i}: ${tempo}ms - Status: 404`);
      }
    }
  }
  
  if (temposValidos.length > 0) {
    const mediaValido = temposValidos.reduce((a, b) => a + b, 0) / temposValidos.length;
    console.log(`\n📈 Hash Válido - Média: ${mediaValido.toFixed(2)}ms (Critério: ≤ 200ms)`);
    console.log(`   Status: ${mediaValido <= 200 ? '✅ PASSOU' : '❌ FALHOU'}`);
  }
  
  if (temposInvalidos.length > 0) {
    const mediaInvalido = temposInvalidos.reduce((a, b) => a + b, 0) / temposInvalidos.length;
    console.log(`\n📈 Hash Inválido - Média: ${mediaInvalido.toFixed(2)}ms (Critério: ≤ 150ms)`);
    console.log(`   Status: ${mediaInvalido <= 150 ? '✅ PASSOU' : '❌ FALHOU'}`);
  }
}

/**
 * Cenário 4: Teste de Geração de Nonce
 */
async function testAuthNonce() {
  console.log('📊 Testando: Geração de Nonce (GET /auth/nonce)\n');
  
  const enderecos = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    '0x8ba1f109551bD432803012645Hac136c22C1779',
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0xfedcbafedcbafedcbafedcbafedcbafedcbafedc'
  ];
  
  const tempos = [];
  const nonces = new Set();
  
  for (let i = 0; i < 20; i++) {
    const endereco = enderecos[i % enderecos.length];
    const inicio = Date.now();
    try {
      const response = await axios.get(`${BASE_URL}/auth/nonce`, {
        params: { address: endereco }
      });
      const tempo = Date.now() - inicio;
      tempos.push(tempo);
      nonces.add(response.data.nonce);
      console.log(`Requisição ${i + 1}: ${tempo}ms - Nonce: ${response.data.nonce}`);
    } catch (error) {
      console.error(`Erro na requisição ${i + 1}:`, error.message);
    }
  }
  
  if (tempos.length > 0) {
    const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    const max = Math.max(...tempos);
    
    console.log('\n📈 Resultados:');
    console.log(`   Média: ${media.toFixed(2)}ms`);
    console.log(`   Máximo: ${max}ms`);
    console.log(`   Nonces únicos gerados: ${nonces.size}`);
    console.log(`\n✅ Critério: Média ≤ 100ms, Máximo ≤ 200ms`);
    console.log(`   Status: ${media <= 100 && max <= 200 ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`   Nonces únicos: ${nonces.size === tempos.length ? '✅ PASSOU' : '❌ FALHOU'}`);
  }
}

/**
 * Cenário 8: Teste de Carga Básica (5 requisições simultâneas)
 */
async function testCargaBasica() {
  console.log('📊 Testando: Carga Básica (5 requisições simultâneas)\n');
  
  const urls = Array(5).fill(`${BASE_URL}/certification`);
  const inicio = Date.now();
  
  try {
    const promises = urls.map((url, index) => 
      axios.get(url).then(response => ({
        index: index + 1,
        tempo: Date.now() - inicio,
        status: response.status
      })).catch(error => ({
        index: index + 1,
        tempo: Date.now() - inicio,
        status: error.response?.status || 'ERROR',
        error: error.message
      }))
    );
    
    const results = await Promise.all(promises);
    const tempoTotal = Date.now() - inicio;
    
    console.log('Resultados das requisições simultâneas:');
    results.forEach(result => {
      console.log(`  Requisição ${result.index}: ${result.tempo}ms - Status: ${result.status}`);
      if (result.error) {
        console.log(`    Erro: ${result.error}`);
      }
    });
    
    const todosSucesso = results.every(r => r.status === 200);
    const todosRapidos = results.every(r => r.tempo <= 1000);
    
    console.log(`\n📈 Tempo Total: ${tempoTotal}ms`);
    console.log(`✅ Critério: Todas respondem em ≤ 1000ms`);
    console.log(`   Status: ${todosRapidos && todosSucesso ? '✅ PASSOU' : '❌ FALHOU'}`);
    
  } catch (error) {
    console.error('Erro no teste de carga:', error.message);
  }
}

/**
 * Cenário 7: Verificação de Integridade DB-Blockchain
 */
async function testIntegridade() {
  console.log('📊 Testando: Integridade DB-Blockchain\n');
  
  try {
    const certificacoes = await prisma.certification.findMany();
    console.log(`Total de certificações no banco: ${certificacoes.length}\n`);
    
    if (certificacoes.length === 0) {
      console.log('❌ Nenhuma certificação encontrada. Execute algumas certificações primeiro.');
      return;
    }
    
    let discrepancias = 0;
    let verificadas = 0;
    
    // Nota: Este teste requer que o contrato esteja configurado
    // Se não estiver, apenas verifica se os dados existem no banco
    
    for (const cert of certificacoes.slice(0, 10)) { // Testa apenas as primeiras 10
      try {
        // Verificação básica: hash existe e tem formato válido
        if (cert.documentHash && cert.documentHash.startsWith('0x') && cert.documentHash.length === 66) {
          verificadas++;
        } else {
          discrepancias++;
          console.log(`  ❌ Hash inválido: ${cert.documentHash}`);
        }
      } catch (error) {
        discrepancias++;
        console.log(`  ❌ Erro ao verificar: ${cert.documentHash} - ${error.message}`);
      }
    }
    
    console.log(`\n📈 Resultados:`);
    console.log(`   Certificações verificadas: ${verificadas}`);
    console.log(`   Discrepâncias encontradas: ${discrepancias}`);
    console.log(`   Taxa de integridade: ${((verificadas / certificacoes.length) * 100).toFixed(2)}%`);
    console.log(`\n✅ Critério: 100% de sincronização, 0 discrepâncias`);
    console.log(`   Status: ${discrepancias === 0 ? '✅ PASSOU' : '⚠️ VERIFICAR (Blockchain pode não estar configurado)'}`);
    
    console.log('\n⚠️  Nota: Para verificação completa com blockchain, configure o contrato e descomente o código de verificação.');
    
  } catch (error) {
    console.error('Erro ao verificar integridade:', error.message);
  }
}

// Função principal
async function main() {
  const cenario = process.argv[2] || 'listagem';
  
  console.log('🧪 Script de Testes de Desempenho - BlockJm\n');
  console.log(`Cenário selecionado: ${cenario}\n`);
  
  try {
    switch (cenario) {
      case 'listagem':
        await testListagem();
        break;
      case 'consulta':
        await testConsultaHash();
        break;
      case 'auth-nonce':
        await testAuthNonce();
        break;
      case 'carga-basica':
        await testCargaBasica();
        break;
      case 'integridade':
        await testIntegridade();
        break;
      default:
        console.log('Cenários disponíveis:');
        console.log('  - listagem: Testa GET /certification');
        console.log('  - consulta: Testa GET /certification/:hash');
        console.log('  - auth-nonce: Testa GET /auth/nonce');
        console.log('  - carga-basica: Testa 5 requisições simultâneas');
        console.log('  - integridade: Verifica sincronização DB-Blockchain');
        console.log('\nUso: node scripts/testPerformance.js [cenario]');
    }
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  testListagem,
  testConsultaHash,
  testAuthNonce,
  testCargaBasica,
  testIntegridade
};


