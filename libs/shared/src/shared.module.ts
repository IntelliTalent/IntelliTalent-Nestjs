import { DynamicModule, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  ServiceName,
  mapServiceNameToQueueName,
} from './config/environment.constants';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import {
  RedisDBName,
  getRedisConfig,
  getRedisDatabase,
} from './config/redis.config';
import {
  MongoDBName,
  getMongoDatabase,
  getMongoUrl,
} from './config/mongodb.config';
import { getServiceDatabse } from './config/postgres.config';
import { getRabbitMQOptions } from './config/rabbitmq.config';
/**
 * SharedModule is a module in the NestJS application.
 * It provides shared functionality that can be used by other modules.
 *
 *
 * The SharedModule class has the following static method:
 *
 * registerRmq(service: string, queue: string): DynamicModule - This method creates a dynamic module that provides a RabbitMQ client proxy.
 * The client proxy is configured to connect to a specific RabbitMQ queue.
 * The method takes two parameters: the name of the service that the client proxy will be provided under, and the name of the RabbitMQ queue to connect to.
 * The method returns a DynamicModule, which is a module that can be created and configured at runtime.
 *
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
  ],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {
  static registerRedis(dbName: RedisDBName): DynamicModule {
    const redisProviders = [
      {
        provide: 'Redis_CONNECTION',
        useFactory: async (): Promise<RedisModuleOptions> => {
          const redisDbName = await getRedisDatabase(dbName);
          const { HOST, PASSWORD, PORT } = await getRedisConfig();
          const url = `redis://:${PASSWORD}@${HOST}:${PORT}`;

          return {
            options: {
              db: redisDbName,
              autoResubscribe: true,
              autoResendUnfulfilledCommands: true,
              enableReadyCheck: true,
              keepAlive: 1000,
              maxRetriesPerRequest: 40,
              reconnectOnError: (error: Error) => {
                console.log('error', error);
                const targetError = 'READONLY';
                if (error.message.includes(targetError)) {
                  return 2;
                }
                return false;
              },
              retryStrategy: (times: number) => {
                if (times > 20) {
                  return undefined;
                }
                return Math.min(times * 50, 2000);
              },
              connectTimeout: 10000,
            },
            type: 'single',
            url: url,
          };
        },
        inject: [ConfigService],
      },
    ];

    return {
      module: SharedModule,
      imports: [
        RedisModule.forRootAsync({
          useFactory: redisProviders[0].useFactory,
        }),
      ],
      providers: redisProviders,
      exports: redisProviders,
    };
  }

  static async getRedisDBURL(dbName: RedisDBName): Promise<string> {
    const redisDBNUm = await getRedisDatabase(dbName);
    const { HOST, PASSWORD, PORT } = await getRedisConfig();
    const url = `redis://:${PASSWORD}@${HOST}:${PORT}/${redisDBNUm}`;
    return url;
  }

  static registerMongoDB(dbName: MongoDBName): DynamicModule {
    const mongoProviders = [
      {
        provide: 'MONGODB_CONNECTION',
        useFactory: async (): Promise<MongooseModuleFactoryOptions> => {
          const mongoDbName = await getMongoDatabase(dbName);
          const url = await getMongoUrl(mongoDbName);
          return {
            dbName: mongoDbName,
            uri: url,
          };
        },
        inject: [ConfigService],
      },
    ];

    return {
      module: SharedModule,
      imports: [
        MongooseModule.forRootAsync({
          useFactory: mongoProviders[0].useFactory,
        }),
      ],
      providers: mongoProviders,
      exports: mongoProviders,
    };
  }

  static registerPostgres(
    serviceType: ServiceName,
    entities: any[],
    testingEnv = false,
  ): DynamicModule {
    const providers = [
      {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<TypeOrmModuleOptions> => {
          const configObject: TypeOrmModuleOptions =
            await getServiceDatabse(serviceType);
          Object.assign(configObject, { entities: entities, dropSchema: testingEnv });
          return configObject;
        },
      },
    ];

    return {
      module: SharedModule,
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: providers[0].useFactory,
        }),
      ],
      providers,
      exports: providers,
    };
  }

  static async registerRmq(service: ServiceName): Promise<DynamicModule> {
    const queue = await mapServiceNameToQueueName(service);

    const providers = [
      {
        provide: service,
        useFactory: async () => {
          return ClientProxyFactory.create(await getRabbitMQOptions(queue));
        },
        inject: [ConfigService],
      },
    ];

    return {
      module: SharedModule,
      providers,
      exports: providers,
    };
  }
}
