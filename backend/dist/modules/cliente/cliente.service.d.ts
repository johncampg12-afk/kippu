import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
export declare class ClienteService {
    private clienteRepo;
    constructor(clienteRepo: Repository<Cliente>);
    create(createClienteDto: CreateClienteDto): Promise<Cliente>;
    findAll(empresaId?: string): Promise<Cliente[]>;
    findOne(id: string): Promise<Cliente>;
    update(id: string, updateData: Partial<CreateClienteDto>): Promise<Cliente>;
    remove(id: string): Promise<void>;
}
