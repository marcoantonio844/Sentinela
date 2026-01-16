import { Controller, Get, Param } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // Rota para buscar todos (http://localhost:3000/drivers)
  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  // Rota para buscar um só pelo ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(+id); // O '+' converte texto para número
  }
}