import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
export declare class EmpresaController {
    private readonly empresaService;
    constructor(empresaService: EmpresaService);
    create(createEmpresaDto: CreateEmpresaDto): Promise<import("./entities/empresa.entity").Empresa>;
    findAll(): Promise<import("./entities/empresa.entity").Empresa[]>;
    findOne(id: string): Promise<import("./entities/empresa.entity").Empresa>;
    update(id: string, updateEmpresaDto: UpdateEmpresaDto): Promise<import("./entities/empresa.entity").Empresa>;
    remove(id: string): Promise<void>;
}
