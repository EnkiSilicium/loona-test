import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageProducerPort, MQ_PRODUCER } from 'adapter';
import { ApiServiceController } from 'apps/api-service/src/app/adapters/inbound/api-service.controller';
import { BookingConsumer } from 'apps/api-service/src/app/adapters/inbound/booking.consumer';
import { KafkaMessageProducer } from 'apps/api-service/src/app/adapters/outbound/api-service.producer';
import { BookingRequestService } from 'apps/api-service/src/app/application/booking-request.service';
import { apiServiceKafkaConfig } from 'apps/api-service/src/app/infra/config/kafka.config';
import { apiServiceTypeOrmOptions } from 'apps/api-service/src/app/infra/config/typeorm.config';
import { BookingRequestRepository } from 'apps/api-service/src/app/infra/persistence/repository/booking-request.repository';
import { LoggingInterceptor } from 'observability';
import { TypeOrmUoW } from 'persistence';
import type { DataSourceOptions } from 'typeorm';


@Module({
    imports: [
        TypeOrmModule.forRoot(apiServiceTypeOrmOptions as DataSourceOptions),
        ClientsModule.register([
            {
                name: MQ_PRODUCER,
                transport: Transport.KAFKA,
                options: {
                    client: apiServiceKafkaConfig.client,
                    producer: apiServiceKafkaConfig.producer,
                    run: apiServiceKafkaConfig.run,
                    consumer: apiServiceKafkaConfig.consumer,
                },
            },
        ]),
    ],
    controllers: [ApiServiceController, BookingConsumer],
    providers: [
        TypeOrmUoW,
        {
            provide: MessageProducerPort,
            useClass: KafkaMessageProducer
        },

        BookingRequestService,
        LoggingInterceptor,

        BookingRequestRepository,
    ]
})
export class AppModule { }
