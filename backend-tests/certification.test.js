// Mocks: Prisma client, ethers Contract and fs for ABI loading
const mockPrisma = {
  certification: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

const mockContract = {
  certifyDocument: jest.fn(async (documentHash) => ({ hash: '0xdeadbeef' })),
  getCertification: jest.fn(async (documentHash) => [Math.floor(Date.now() / 1000), '0xcertifier'])
};

jest.mock('fs', () => ({
  readFileSync: () => JSON.stringify({ abi: [] })
}));

jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn(() => ({})),
    Wallet: jest.fn(() => ({ address: '0xwallet' })),
    Contract: jest.fn(() => mockContract),
    verifyMessage: jest.fn()
  }
}));

describe('certificationService (unit)', () => {
  let service;

  beforeEach(() => {
    jest.resetModules();
    // Ensure envs present so module initializes contract via mocked ethers
    process.env.PRIVATE_KEY = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    process.env.CONTRACT_ADDRESS = '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC';
    service = require('../api/services/certificationService');
    // reset mock implementations
    mockPrisma.certification.findUnique.mockReset();
    mockPrisma.certification.create.mockReset();
    mockPrisma.certification.findMany.mockReset();
    mockPrisma.certification.update.mockReset();
    mockPrisma.certification.delete.mockReset();
    mockContract.certifyDocument.mockReset();
    mockContract.getCertification.mockReset();
  });

  test('listAll returns results from prisma.findMany', async () => {
    const rows = [{ documentHash: '0x1' }];
    mockPrisma.certification.findMany.mockResolvedValue(rows);

    const result = await service.listAll();
    expect(result).toBe(rows);
    expect(mockPrisma.certification.findMany).toHaveBeenCalled();
  });

  test('certifyDocument succeeds when not existing', async () => {
    mockPrisma.certification.findUnique.mockResolvedValue(null);
    mockContract.certifyDocument.mockResolvedValue({ hash: '0xdeadbeef' });
    mockPrisma.certification.create.mockResolvedValue({ documentHash: '0xabc' });

    const res = await service.certifyDocument('0xabc');
    expect(res).toHaveProperty('message', 'Documento certificado');
    expect(res).toHaveProperty('txHash', '0xdeadbeef');
    expect(mockPrisma.certification.create).toHaveBeenCalled();
  });

  test('certifyDocument throws when already certified', async () => {
    mockPrisma.certification.findUnique.mockResolvedValue({ id: 1, documentHash: '0xabc' });
    await expect(service.certifyDocument('0xabc')).rejects.toThrow(/Documento já certificado/);
  });

  test('getCertification returns data from contract', async () => {
    const fakeTs = Math.floor(Date.now() / 1000);
    mockContract.getCertification.mockResolvedValue([fakeTs, '0xcertifier']);

    const res = await service.getCertification('0x1');
    expect(res).toHaveProperty('documentHash', '0x1');
    expect(res).toHaveProperty('certifier', '0xcertifier');
    expect(res.timestamp instanceof Date).toBeTruthy();
  });

  test('updateCertification updates when exists', async () => {
    mockPrisma.certification.findUnique.mockResolvedValue({ documentHash: '0x1' });
    mockPrisma.certification.update.mockResolvedValue({ documentHash: '0x1', txHash: '0x1' });

    const res = await service.updateCertification('0x1', { txHash: '0x1' });
    expect(res).toHaveProperty('documentHash', '0x1');
  });

  test('updateCertification throws when not found', async () => {
    mockPrisma.certification.findUnique.mockResolvedValue(null);
    await expect(service.updateCertification('0x1', {})).rejects.toThrow(/Certificação não encontrada/);
  });

  test('deleteCertification deletes when exists', async () => {
    mockPrisma.certification.findUnique.mockResolvedValue({ documentHash: '0x1' });
    mockPrisma.certification.delete.mockResolvedValue({ documentHash: '0x1' });

    const res = await service.deleteCertification('0x1');
    expect(res).toHaveProperty('documentHash', '0x1');
  });

  test('deleteCertification throws when not found', async () => {
    mockPrisma.certification.findUnique.mockResolvedValue(null);
    await expect(service.deleteCertification('0x1')).rejects.toThrow(/Certificação não encontrada/);
  });
});
