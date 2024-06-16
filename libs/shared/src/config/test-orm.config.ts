import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import getConfigVariables from './configVariables.config';
import { Constants } from './environment.constants';

export const TypeOrmSQLITETestingModule = (entities: EntityClassOrSchema[]) => [
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: getConfigVariables(Constants.DB.dbHost),
    port: +getConfigVariables(Constants.DB.dbPort),
    username: getConfigVariables(Constants.DB.dbUserName),
    password: getConfigVariables(Constants.DB.dbPassword),
    dropSchema: true,
    synchronize: true,
    autoLoadEntities: true,
  }),
  TypeOrmModule.forFeature(entities),
];
