import { Injectable } from '@nestjs/common';
import { Cat } from './schemas/cat.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JobsService {

  constructor(@InjectModel(Cat.name) private catModel: Model<Cat>) {
    this.create({
      name: 'waer',
      age: 1,
      breed: 'test'
    })
  }

  async create(createCatDto: any): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
