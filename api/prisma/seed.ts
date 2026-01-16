import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando frota completa...');

  // Limpa o banco antes de criar (para não duplicar se rodar 2x)
  await prisma.driver.deleteMany();

  const drivers = [
    { name: 'João Silva', vehicle: 'Scania R450', status: 'EM_ROTA', lat: -23.5505, lng: -46.6333 },
    { name: 'Maria Oliveira', vehicle: 'Volvo FH', status: 'PARADO', lat: -23.5596, lng: -46.6587 },
    { name: 'Carlos Santos', vehicle: 'Mercedes Actros', status: 'EM_ROTA', lat: -23.5489, lng: -46.6166 }, // Zona Leste
    { name: 'Ana Pereira', vehicle: 'Iveco Stralis', status: 'EM_ROTA', lat: -23.5800, lng: -46.6900 }, // Zona Sul
    { name: 'Pedro Costa', vehicle: 'DAF XF', status: 'PARADO', lat: -23.5200, lng: -46.7000 }, // Zona Oeste
    { name: 'Lucas Lima', vehicle: 'VW Meteor', status: 'EM_ROTA', lat: -23.5000, lng: -46.6000 }, // Zona Norte
  ];

  for (const driver of drivers) {
    await prisma.driver.create({
      data: {
        name: driver.name,
        vehicle: driver.vehicle,
        status: driver.status,
        latitude: driver.lat,
        longitude: driver.lng,
      },
    });
  }

  console.log('✅ Frota criada com sucesso!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });