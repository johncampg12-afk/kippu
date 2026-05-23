import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
export declare class ClienteController {
    private readonly clienteService;
    constructor(clienteService: ClienteService);
    create(createClienteDto: CreateClienteDto): Promise<import("./entities/cliente.entity").Cliente>;
    findAll(empresaId?: string): Promise<import("./entities/cliente.entity").Cliente[]>;
    findOne(id: string): Promise<import("./entities/cliente.entity").Cliente>;
    update(id: string, updateData: Partial<CreateClienteDto>): Promise<import("./entities/cliente.entity").Cliente>;
    remove(id: string): Promise<void>;
}
