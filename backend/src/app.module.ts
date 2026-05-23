import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { ProductoModule } from './modules/producto/producto.module';
import { CertificadoModule } from './modules/certificado/certificado.module';
import { FacturaModule } from './modules/factura/factura.module';
import { SriModule } from './modules/sri/sri.module';
import { AuthModule } from './modules/auth/auth.module';  

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.production', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false, // Obligatorio para Neon
        },
        logging: true,
      }),
      inject: [ConfigService],
    }),
    EmpresaModule,
    ClienteModule,
    ProductoModule,
    CertificadoModule,
    FacturaModule,
    SriModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}