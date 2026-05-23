import { Repository } from 'typeorm';
import { RucCache } from './entities/ruc-cache.entity';
export declare class SriRucService {
    private readonly rucCacheRepo;
    constructor(rucCacheRepo: Repository<RucCache>);
    private validarDigitoVerificador;
    private validarCedula;
    consultarRuc(ruc: string): Promise<any>;
    guardarDatosRuc(ruc: string, datos: any): Promise<void>;
}
