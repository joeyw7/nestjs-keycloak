import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as session from 'express-session';
import * as Keycloak from 'keycloak-connect';
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const memoryStore = new session.MemoryStore();
    const kcConfig = {
      clientId: 'nest-app',
      bearerOnly: false,
      serverUrl: 'http://localhost:9990/auth',
      realm: 'demo',
    };
    const keycloak = new Keycloak({ store: memoryStore }, kcConfig);
    consumer
      .apply(
        session({
          secret: 'some secret',
          resave: false,
          saveUninitialized: true,
          store: memoryStore,
        }),
      )
      .forRoutes(AppController);
    consumer.apply(keycloak.middleware()).forRoutes(AppController);
    consumer.apply(keycloak.checkSso()).forRoutes(AppController);
  }
}
