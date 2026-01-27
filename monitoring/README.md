# 📊 Sistema de Monitoramento - BlockJm

Este diretório contém os recursos para monitoramento da infraestrutura em nuvem e da rede blockchain do sistema BlockJm.

## 📁 Estrutura de Arquivos

```
monitoring/
├── README.md              # Este arquivo
├── metrics.json           # Métricas em formato JSON (estruturado)
└── ../MONITORING_REPORT.md # Relatório completo em Markdown
```

## 🚀 Como Gerar Relatórios

### Método 1: Usando NPM Script (Recomendado)

```bash
npm run monitoring:report
```

Este comando irá:
1. Gerar métricas simuladas baseadas em valores realistas
2. Criar/atualizar o arquivo `MONITORING_REPORT.md` na raiz do projeto
3. Atualizar o arquivo `monitoring/metrics.json` com as métricas estruturadas

### Método 2: Executando o Script Diretamente

```bash
node scripts/generateMonitoringReport.js
```

## 📊 Formato dos Relatórios

### Relatório Markdown (`MONITORING_REPORT.md`)

Relatório completo e detalhado em formato Markdown, incluindo:

- **Sumário Executivo** - Visão geral do status do sistema
- **Monitoramento de Infraestrutura em Nuvem**
  - Utilização de CPU (Central Processing Unit)
  - Utilização de Memória (RAM)
  - Armazenamento em Disco
  - Tráfego de Rede
- **Monitoramento da Rede Blockchain**
  - Status e Conectividade
  - Throughput de Transações
  - Tempo de Confirmação
  - Integridade dos Dados
- **Desempenho do Sistema**
  - Tempo de Resposta da API
  - Throughput de Requisições
- **Segurança e Integridade**
  - Autenticação e Autorização
  - Validação de Uploads
  - Verificação de Integridade
- **Tendências e Análise**
- **Alertas e Incidentes**
- **Conformidade com SLAs**

### Métricas JSON (`monitoring/metrics.json`)

Arquivo estruturado em JSON contendo todas as métricas coletadas, ideal para:

- Integração com ferramentas de monitoramento (Prometheus, Grafana, etc.)
- Processamento automatizado
- APIs de monitoramento
- Dashboards em tempo real

## 📈 Métricas Coletadas

### Infraestrutura em Nuvem

- **CPU**: Utilização média, pico e mínima
- **Memória**: Uso atual, pico e distribuição por processo
- **Armazenamento**: Espaço utilizado, crescimento diário
- **Rede**: Tráfego de entrada/saída, requisições por endpoint

### Rede Blockchain

- **Disponibilidade**: Uptime, latência, taxa de sucesso
- **Transações**: Total enviadas, confirmadas, pendentes, falhadas
- **Throughput**: Transações por hora/minuto, picos de demanda
- **Tempo de Confirmação**: Média, mínima, máxima, percentis (P95, P99)
- **Gas**: Consumo médio por transação, total consumido
- **Integridade**: Sincronização DB ↔ Blockchain, validação de hashes

### Desempenho da API

- **Tempo de Resposta**: Por endpoint (média, P95, P99)
- **Throughput**: Requisições por segundo (RPS)
- **Distribuição de Carga**: Por período do dia

### Segurança

- **Autenticação**: Tentativas de login, taxa de sucesso/falha
- **Uploads**: Validação de arquivos, tamanhos processados
- **Integridade**: Checksums verificados, corrupção detectada

## 🔧 Personalização

Para personalizar as métricas geradas, edite o arquivo `scripts/generateMonitoringReport.js`:

```javascript
// Ajuste os ranges de valores simulados
const cpuAverage = 30 + Math.random() * 10; // 30-40%
const memoryUsed = 1.0 + Math.random() * 0.5; // 1.0-1.5 GB
const totalTransactions = 1000 + Math.floor(Math.random() * 500);
```

## 📊 Integração com Ferramentas de Monitoramento

### Prometheus

O arquivo `metrics.json` pode ser convertido para formato Prometheus usando um script de conversão:

```javascript
// Exemplo de conversão
const metrics = require('./metrics.json');
// Converter para formato Prometheus
```

### Grafana

Importe o arquivo JSON como fonte de dados e crie dashboards personalizados.

### CloudWatch / Datadog

Use o formato JSON para enviar métricas customizadas via API.

## 🎯 SLAs Monitorados

O sistema verifica conformidade com os seguintes SLAs:

- **Disponibilidade API**: ≥ 99.5%
- **Disponibilidade Blockchain**: ≥ 99.9%
- **Tempo de Resposta (P95)**: ≤ 5s
- **Taxa de Sucesso de Transações**: ≥ 99%
- **CPU Média**: ≤ 70%
- **Memória Média**: ≤ 80%
- **Integridade de Dados**: 100%

## 📝 Notas Importantes

⚠️ **Este é um sistema de simulação**: As métricas são geradas aleatoriamente dentro de ranges realistas para fins de demonstração.

⚠️ **Para produção**: Integre com ferramentas reais de monitoramento como:
- Prometheus + Grafana
- AWS CloudWatch
- Datadog
- New Relic
- Custom monitoring solutions

## 🔄 Agendamento Automático

Para gerar relatórios automaticamente, configure um cron job ou agendador de tarefas:

### Linux/Mac (Cron)

```bash
# Gerar relatório diariamente às 00:00
0 0 * * * cd /caminho/para/projeto && npm run monitoring:report
```

### Windows (Task Scheduler)

Configure uma tarefa agendada para executar:
```
npm run monitoring:report
```

## 📞 Suporte

Para questões sobre o sistema de monitoramento, consulte:
- Documentação principal: `README.md`
- Relatório de segurança: `SECURITY_AUDIT.md`
- Guia de segurança: `SECURITY.md`

---

**Última atualização:** 2025-01-XX



