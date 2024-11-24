import { DynamicModule, Module, Provider } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { RedisService } from "./cache/redis/redis.service";
import { PostgresService } from "./dbs/postgres/postgres.service";
import { Pokemon } from "./types/dtos/pokemon.entity";
import { User } from "./types/dtos/user.entity";
import { ConfigurableModuleClass } from "./types/config-builder";


@Module({})
export class FactoryModule extends ConfigurableModuleClass {
    private static getDBProvider() {

        const dbOptions: any = {
            type: process.env.DB_TYPE as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql' | 'oracle', 
            host: process.env.DB_HOST, 
            port: Number(process.env.DB_PORT), 
            username: process.env.DB_USERNAME, 
            password: process.env.DB_PASSWORD, 
            database: process.env.DB_DATABASE, 
            synchronize: true, 
            logging: false,
            entities: [User, Pokemon]
        };

        const dbProvider: Provider = {
            provide: 'DB_SERVICE',
            useFactory: (dataSource: DataSource) => {
                const dbType = process.env.DB_TYPE;
                switch (dbType) {
                    case 'postgres': return new PostgresService(dataSource);
                    default: throw new Error(`Unsupported database type: ${dbType}`);
                }
            },
            inject: [DataSource]
        };

        return { provider: dbProvider, options: dbOptions };
    }

    private static getCacheProvider() {

        const cacheOptions: any = {
            socket: {
                host: process.env.CACHE_HOST,
                port: Number(process.env.CACHE_PORT),
            },
            ttl: Number(process.env.CACHE_TTL),
        };

        const cacheProvider: Provider = {
            provide: 'CACHE_SERVICE',
            useFactory: () => {
                const cacheType = process.env.CACHE_TYPE;
                switch (cacheType) {
                    case 'redis': return new RedisService(cacheOptions);
                    default: throw new Error(`Unsupported cache type: ${cacheType}`);
                }
            }
        };

        return { provider: cacheProvider, options: cacheOptions };
    }

    static forRoot(): DynamicModule {

        const db = FactoryModule.getDBProvider();
        const cache = FactoryModule.getCacheProvider();

        const providers = [
            db.provider, 
            cache.provider
        ]; 

        return {
            module: FactoryModule,
            imports: [
                ConfigModule,
                TypeOrmModule.forRoot({ ...db.options })
            ],
            providers: [...providers],
            exports: [...providers],
        };
    }
}