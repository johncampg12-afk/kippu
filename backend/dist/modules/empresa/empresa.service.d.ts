import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
export declare class EmpresaService {
    private empresaRepo;
    constructor(empresaRepo: Repository<Empresa>);
    create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa>;
    findAll(): Promise<Empresa[]>;
    findOne(id: string): Promise<Empresa>;
    update(id: string, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa>;
    remove(id: string): Promise<void>;
}
