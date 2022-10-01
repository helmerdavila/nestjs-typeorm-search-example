import { Controller, Get, Post, Query } from '@nestjs/common';
import { Pet } from './entities/pet';
import {
  Brackets,
  FindManyOptions,
  FindOptionsWhere,
  InsertResult,
  Like,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Owner } from './entities/owner';

@Controller('pets')
export class AppController {
  constructor(
    @InjectRepository(Pet) private petRepository: Repository<Pet>,
    @InjectRepository(Owner) private ownerRepository: Repository<Owner>,
  ) {}

  @Get('/repository')
  async searchUsingRepository(@Query('search') search?: string) {
    const options: FindManyOptions<Pet> = { relations: { owner: true } };

    if (search?.length) {
      const searchFormattedText = search.trim().split(' ');
      const where: FindOptionsWhere<Pet>[] = [];

      for (const word of searchFormattedText) {
        where.push({ owner: { firstName: Like(`%${word}%`) } });
        where.push({ owner: { lastName: Like(`%${word}%`) } });
      }

      options.where = where;
    }

    const pets = await this.petRepository.find(options);

    return { pets };
  }

  @Get('/querybuilder')
  async searchUsingQueryBuilder(@Query('search') search?: string) {
    let query = this.petRepository.createQueryBuilder('p').innerJoinAndSelect('p.owner', 'o');

    if (search?.length) {
      const searchFormattedText = search.trim().split(' ');

      query = query.andWhere(
        new Brackets((queryPart: SelectQueryBuilder<Pet>) => {
          for (const word of searchFormattedText) {
            queryPart.orWhere('o.first_name like :firstName', {
              firstName: `%${word}%`,
            });
            queryPart.orWhere('o.last_name like :lastName', {
              lastName: `%${word}%`,
            });
          }
        }),
      );
    }

    const pets = await query.getMany();

    return { pets };
  }

  @Post('/fakes')
  async fakes() {
    const ownerPromises: Promise<InsertResult>[] = [];
    let ownerCount = await this.ownerRepository.count();

    for (let i = ownerCount + 1; i <= ownerCount + 100; i++) {
      const owner = new Owner();
      owner.firstName = `first_${i} name_${i}`;
      owner.lastName = `last_${i} name_${i}`;
      ownerPromises.push(this.ownerRepository.insert(owner));
    }

    await Promise.all(ownerPromises);

    ownerCount = await this.ownerRepository.count();

    const petPromises: Promise<InsertResult>[] = [];
    let petCount = await this.petRepository.count();

    for (let j = petCount + 1; j <= petCount + 100; j++) {
      const pet = new Pet();
      pet.ownerId = this.#randomInteger(1, ownerCount);
      petPromises.push(this.petRepository.insert(pet));
    }

    await Promise.all(petPromises);

    petCount = await this.petRepository.count();

    return { ownerCount, petCount };
  }

  #randomInteger(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
}
