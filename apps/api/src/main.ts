import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  // Keep startup logs explicit for deployment diagnostics.
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
