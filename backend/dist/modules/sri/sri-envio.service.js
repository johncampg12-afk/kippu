"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SriEnvioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const factura_entity_1 = require("../factura/entities/factura.entity");
const fs = __importStar(require("fs"));
const axios = __importStar(require("axios"));
const xml2js = __importStar(require("xml2js"));
let SriEnvioService = class SriEnvioService {
    facturaRepo;
    constructor(facturaRepo) {
        this.facturaRepo = facturaRepo;
    }
    async enviarComprobante(facturaId) {
        const factura = await this.facturaRepo.findOne({
            where: { id: facturaId },
            relations: ['empresa'],
        });
        if (!factura) {
            throw new common_1.BadRequestException('Factura no encontrada');
        }
        const xmlFirmadoPath = factura.xmlPath?.replace('.xml', '-firmado.xml');
        if (!xmlFirmadoPath || !fs.existsSync(xmlFirmadoPath)) {
            throw new common_1.BadRequestException('XML firmado no encontrado. Primero firme el comprobante.');
        }
        const xmlFirmado = fs.readFileSync(xmlFirmadoPath, 'utf8');
        const xmlBase64 = Buffer.from(xmlFirmado).toString('base64');
        const urlRecepcion = factura.ambiente === '01'
            ? 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl'
            : 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';
        const soapEnvelope = this.construirSoapEnvelope(xmlBase64);
        try {
            const response = await axios.default.post(urlRecepcion, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': '',
                },
                timeout: 30000,
            });
            const resultado = await this.procesarRespuestaRecepcion(response.data);
            factura.estado = resultado.estado;
            if (resultado.estado === factura_entity_1.EstadoFactura.AUTORIZADA) {
                factura.numeroAutorizacion = resultado.numeroAutorizacion;
                factura.fechaAutorizacion = new Date();
            }
            if (resultado.mensajeError) {
                factura.mensajeError = resultado.mensajeError;
            }
            await this.facturaRepo.save(factura);
            return {
                success: resultado.estado === factura_entity_1.EstadoFactura.AUTORIZADA,
                estado: resultado.estado,
                numeroAutorizacion: resultado.numeroAutorizacion,
                mensaje: resultado.mensaje,
                mensajeError: resultado.mensajeError,
            };
        }
        catch (error) {
            factura.estado = factura_entity_1.EstadoFactura.RECHAZADA;
            factura.mensajeError = error.message;
            await this.facturaRepo.save(factura);
            throw new common_1.BadRequestException(`Error al enviar al SRI: ${error.message}`);
        }
    }
    async consultarComprobante(claveAcceso, ambiente = '01') {
        const urlAutorizacion = ambiente === '01'
            ? 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
            : 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';
        const soapEnvelope = this.construirSoapConsulta(claveAcceso);
        try {
            const response = await axios.default.post(urlAutorizacion, soapEnvelope, {
                headers: {
                    'Content-Type': 'text/xml;charset=UTF-8',
                    'SOAPAction': '',
                },
                timeout: 30000,
            });
            return await this.procesarRespuestaAutorizacion(response.data, claveAcceso);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error al consultar SRI: ${error.message}`);
        }
    }
    construirSoapEnvelope(xmlBase64) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:validarComprobante>
      <xml>${xmlBase64}</xml>
    </ec:validarComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;
    }
    construirSoapConsulta(claveAcceso) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">
  <soapenv:Header/>
  <soapenv:Body>
    <ec:autorizacionComprobante>
      <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
    </ec:autorizacionComprobante>
  </soapenv:Body>
</soapenv:Envelope>`;
    }
    async procesarRespuestaRecepcion(xmlRespuesta) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlRespuesta);
        const body = result['soapenv:Envelope']?.['soapenv:Body'];
        const respuesta = body?.['ns2:validarComprobanteResponse'] || body?.['validarComprobanteResponse'];
        const returnValue = respuesta?.return;
        const estado = returnValue?.estado;
        if (estado === 'RECIBIDA') {
            return {
                estado: factura_entity_1.EstadoFactura.ENVIADA,
                mensaje: 'Comprobante recibido por el SRI',
            };
        }
        else if (estado === 'DEVUELTA') {
            const errores = returnValue?.comprobantes?.comprobante?.mensajes?.mensaje;
            const mensajeError = Array.isArray(errores)
                ? errores.map(e => e.mensaje).join('; ')
                : errores?.mensaje || 'Error desconocido';
            return {
                estado: factura_entity_1.EstadoFactura.RECHAZADA,
                mensajeError,
            };
        }
        return {
            estado: factura_entity_1.EstadoFactura.ENVIADA,
        };
    }
    async procesarRespuestaAutorizacion(xmlRespuesta, claveAcceso) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xmlRespuesta);
        const body = result['soapenv:Envelope']?.['soapenv:Body'];
        const respuesta = body?.['ns2:autorizacionComprobanteResponse'] || body?.['autorizacionComprobanteResponse'];
        const returnValue = respuesta?.return;
        const estado = returnValue?.estado;
        if (estado === 'AUTORIZADO') {
            const factura = await this.facturaRepo.findOne({
                where: { claveAcceso },
            });
            if (factura) {
                factura.estado = factura_entity_1.EstadoFactura.AUTORIZADA;
                factura.numeroAutorizacion = returnValue.numeroAutorizacion;
                factura.fechaAutorizacion = new Date(returnValue.fechaAutorizacion);
                await this.facturaRepo.save(factura);
            }
            return {
                estado: 'AUTORIZADO',
                numeroAutorizacion: returnValue.numeroAutorizacion,
                fechaAutorizacion: returnValue.fechaAutorizacion,
            };
        }
        else if (estado === 'NO AUTORIZADO') {
            return {
                estado: 'RECHAZADO',
                mensajeError: returnValue.mensajes?.mensaje || 'Comprobante no autorizado',
            };
        }
        else if (estado === 'EN PROCESO') {
            return {
                estado: 'PENDIENTE',
                mensaje: 'Comprobante en proceso de autorización',
            };
        }
        return { estado };
    }
};
exports.SriEnvioService = SriEnvioService;
exports.SriEnvioService = SriEnvioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(factura_entity_1.Factura)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SriEnvioService);
//# sourceMappingURL=sri-envio.service.js.map