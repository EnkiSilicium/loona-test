import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { setupSwagger } from 'adapter'
import { reservationServiceKafkaConfig } from "apps/booking-service/src/app/infra/config/kafka.config";
import { AppModule } from "apps/booking-service/src/app/infra/di/app.module";
import { LoggingInterceptor } from 'observability'

async function startrandomateApp() {
  const httpPort = Number(process.env.RESERVATIONSERVICE_HTTP_PORT ?? 3001);

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  //app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableShutdownHooks();
  app.setGlobalPrefix(process.env.HTTP_PREFIX ?? 'api');
  app.useGlobalInterceptors(
    //app.get(HttpErrorInterceptor),
    app.get(LoggingInterceptor),
  );

  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: reservationServiceKafkaConfig.client,
      consumer: reservationServiceKafkaConfig.consumer,
      producer: reservationServiceKafkaConfig.producer,
      run: reservationServiceKafkaConfig.run,
    },
  };
  const microservice =
    app.connectMicroservice<MicroserviceOptions>(microserviceOptions);

  microservice.useGlobalInterceptors(
    app.get(LoggingInterceptor),
  );
  await app.startAllMicroservices();


  setupSwagger(app, { title: 'booking-service', path: 'docs', version: '1.0' });

  await app.listen(httpPort);
  const url = await app.getUrl();
  Logger.log({
    message: `[RandomateApp] HTTP listening: ${url}  |  Swagger: ${url}/docs`,
  });
}

async function bootstrap() {

  //otelSDK.start();


  //read assumes entities defined in DB
  await startrandomateApp();

  // Graceful shutdown on signals
  const shutdown = async (signal: string) => {
    console.warn({ message: `\nReceived ${signal}. Shutting down...}` });
    process.exit(0);
  };

  process.on('uncaughtException', (error) => {
    Logger.error({
      message: `Uncaught exception: ${error?.message ?? 'unknown error'}`,
      cause: { ...error },
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    Logger.error({
      message: `Uncaught promise rejection: ${reason ?? 'unspecified reason'}"}`,
      cause: { reason, promise },
    });
  });

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err: unknown) => {
  console.error({ message: 'Fatal on bootstrap:', err });
  process.exit(1);
});
