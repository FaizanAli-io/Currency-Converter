import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const email = 'fali.abdulali@gmail.com';
const local_url = 'http://localhost:5173';
const netlify_url = 'https://currency-converter-faizanali.netlify.app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: [local_url, netlify_url] });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Currency Converter API')
    .setDescription(
      'A comprehensive currency conversion API with historical rates, time series data, and user conversion history tracking.',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'User authentication and account management')
    .addTag('Currency', 'Currency rates and conversion operations')
    .addTag('History', 'User and guest conversion history')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .setContact('Currency Converter Website', netlify_url, email)
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
