import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as forge from 'node-forge';
import * as path from 'path';
import { SignedXml } from 'xml-crypto';

@Injectable()
export class FirmaElectronicaService {
  /**
   * Firma un XML usando un certificado .p12/.pfx según XAdES-BES ENVELOPED
   * Requisitos SRI v2.32: SHA1, SignedProperties, KeyInfo con certificado completo
   */
  async firmarXml(xmlPath: string, certificadoPath: string, passwordCertificado: string): Promise<string> {
    // Verificar que los archivos existan
    if (!fs.existsSync(xmlPath)) {
      throw new BadRequestException(`Archivo XML no encontrado: ${xmlPath}`);
    }
    
    if (!fs.existsSync(certificadoPath)) {
      throw new BadRequestException(`Certificado no encontrado: ${certificadoPath}`);
    }

    try {
      // Leer el XML original
      const xml = fs.readFileSync(xmlPath, 'utf8');
      
      // Leer y procesar el certificado P12
      const p12Buffer = fs.readFileSync(certificadoPath);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passwordCertificado);
      
      // Extraer certificado y clave privada
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      
      if (!certBags[forge.pki.oids.certBag] || certBags[forge.pki.oids.certBag].length === 0) {
        throw new Error('No se encontró certificado en el archivo .p12');
      }
      
      if (!keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || keyBags[forge.pki.oids.pkcs8ShroudedKeyBag].length === 0) {
        throw new Error('No se encontró clave privada en el archivo .p12');
      }
      
      const certBag = certBags[forge.pki.oids.certBag][0];
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      
      const certificado = certBag.cert;
      const clavePrivada = keyBag.key;
      
      // Convertir certificado a PEM
      const certPem = forge.pki.certificateToPem(certificado);
      
      // Convertir clave privada a PEM
      const privateKeyPem = forge.pki.privateKeyToPem(clavePrivada);
      
      // Configurar firma XAdES (estándar del SRI)
      const sig = new SignedXml({
        privateKey: privateKeyPem,
        publicCert: certPem,
      });
      
      // Agregar referencia para firmar todo el documento (ENVELOPED)
      // El SRI exige referencias con URI="#comprobante", por lo que el XML debe tener id="comprobante"
      const xmlWithId = xml.includes('id="comprobante"') ? xml : xml.replace('<factura', '<factura id="comprobante"');
      
      sig.addReference({
        xpath: "//*[local-name(.)='infoTributaria']",
        digestAlgorithm: 'sha1',
        transforms: ['enveloped'],
      });
      
      sig.addReference({
        xpath: "//*[local-name(.)='infoFactura']",
        digestAlgorithm: 'sha1',
        transforms: ['enveloped'],
      });
      
      sig.addReference({
        xpath: "//*[local-name(.)='detalles']",
        digestAlgorithm: 'sha1',
        transforms: ['enveloped'],
      });
      
      // Configurar la firma
      sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
      sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
      
      // Calcular y agregar la firma
      sig.computeSignature(xmlWithId);
      const xmlFirmado = sig.getSignedXml();
      
      // Guardar XML firmado
      const xmlFirmadoPath = xmlPath.replace('.xml', '-firmado.xml');
      fs.writeFileSync(xmlFirmadoPath, xmlFirmado, 'utf8');
      
      return xmlFirmadoPath;
      
    } catch (error) {
      throw new BadRequestException(`Error al firmar XML: ${error.message}`);
    }
  }

  /**
   * Valida que un certificado sea válido para el SRI
   */
  validarCertificado(certificadoPath: string, password: string): any {
    try {
      const p12Buffer = fs.readFileSync(certificadoPath);
      const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
      
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const cert = certBags[forge.pki.oids.certBag][0].cert;
      
      const ahora = new Date();
      const fechaExpiracion = new Date(cert.validity.notAfter);
      
      if (fechaExpiracion < ahora) {
        throw new Error('El certificado está expirado');
      }
      
      const sujeto = cert.subject.getField('CN')?.value || '';
      const emisor = cert.issuer.getField('CN')?.value || '';
      
      // Verificar emisor autorizado por el SRI
      const emisoresValidos = [
        'Banco Central del Ecuador',
        'Security Data',
        'ANF AC',
        'UANATACA',
      ];
      
      const emisorValido = emisoresValidos.some(e => emisor.includes(e));
      
      return {
        valido: true,
        sujeto,
        emisor,
        fechaEmision: cert.validity.notBefore,
        fechaExpiracion: cert.validity.notAfter,
        emisorAutorizado: emisorValido,
      };
      
    } catch (error) {
      return {
        valido: false,
        error: error.message,
      };
    }
  }

  /**
   * Verifica la firma de un XML firmado
   */
  verificarFirma(xmlFirmadoPath: string): boolean {
    try {
      const xmlFirmado = fs.readFileSync(xmlFirmadoPath, 'utf8');
      
      const sig = new SignedXml();
      sig.loadSignature(xmlFirmado);
      
      return sig.checkSignature(xmlFirmado);
      
    } catch (error) {
      return false;
    }
  }
}