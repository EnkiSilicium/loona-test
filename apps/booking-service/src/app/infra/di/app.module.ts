import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageProducerPort, MQ_PRODUCER } from 'adapter';
import { BookingRequestService } from 'apps/api-service/src/app/application/booking-request.service';
import { apiServiceKafkaConfig } from 'apps/api-service/src/app/infra/config/kafka.config';
import { apiServiceTypeOrmOptions } from 'apps/api-service/src/app/infra/config/typeorm.config';
import { BookingRequestRepository } from 'apps/api-service/src/app/infra/persistence/repository/booking-request.repository';
import { ReservationConsumer } from 'apps/booking-service/src/app/adapters/inbound/reservation.consumer';
import { RestaurantAdminController } from 'apps/booking-service/src/app/adapters/inbound/restaraunt-admin.controller';
import { KafkaMessageProducer } from 'apps/booking-service/src/app/adapters/outbound/booking-service.producer';
import { RestaurantAdminService } from 'apps/booking-service/src/app/application/restaraunt-admin-service';
import { TableBookingService } from 'apps/booking-service/src/app/application/table-booking.service';
import { reservationServiceKafkaConfig } from 'apps/booking-service/src/app/infra/config/kafka.config';
import { reservationServiceTypeOrmOptions } from 'apps/booking-service/src/app/infra/config/typeorm.config';
import { BookingRepository } from 'apps/booking-service/src/app/infra/persistence/repository/booking-repository';
import { DiningTableRepository } from 'apps/booking-service/src/app/infra/persistence/repository/dining-table.repository';
import { RestaurantRepository } from 'apps/booking-service/src/app/infra/persistence/repository/restaraunt.repository';
import { LoggingInterceptor } from 'observability';
import { TypeOrmUoW } from 'persistence';
import type { DataSourceOptions } from 'typeorm';


@Module({
    imports: [
        TypeOrmModule.forRoot(reservationServiceTypeOrmOptions as DataSourceOptions),
        ClientsModule.register([
            {
                name: MQ_PRODUCER,
                transport: Transport.KAFKA,
                options: {
                    client: reservationServiceKafkaConfig.client,
                    producer: reservationServiceKafkaConfig.producer,
                    run: reservationServiceKafkaConfig.run,
                    consumer: reservationServiceKafkaConfig.consumer,
                },
            },
        ]),
    ],
    controllers: [ReservationConsumer, RestaurantAdminController],
    providers: [
        {
            provide: MessageProducerPort,
            useClass: KafkaMessageProducer
        },
        BookingRequestService,
        TableBookingService,
        RestaurantAdminService,
        TypeOrmUoW,
        LoggingInterceptor,

        RestaurantRepository,
        DiningTableRepository,
        BookingRepository,
        BookingRequestRepository,

    ],
})
export class AppModule { }
