import { DynamicModule, Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getRabbitMQOptions } from './config/environment.constants';
import {
  ServiceName,
  getServiceDatabse,
  mapServiceNameToQueueName,
} from './config/environment.constants';

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
      envFilePath: './.env',
    }),
  ],
  providers: [SharedService],
  exports: [SharedService],
})
export class SharedModule {
  static registerPostgres(
    serviceType: ServiceName,
    entities: any[],
  ): DynamicModule {
    const providers = [
      {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<TypeOrmModuleOptions> => {
          const configObject: TypeOrmModuleOptions =
            await getServiceDatabse(serviceType);
          Object.assign(configObject, { entities: entities });
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
