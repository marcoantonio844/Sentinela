import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class DriversService {
  
  // Buscar todos os motoristas
  async findAll() {
    return await prisma.driver.findMany();
  }

  // Buscar um só pelo ID (opcional, mas bom ter)
  async findOne(id: number) {
    return await prisma.driver.findUnique({
      where: { id },
    });
  }
}