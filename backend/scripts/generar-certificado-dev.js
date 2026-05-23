const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Configuración
const password = 'admin123';
const outputDir = path.join(__dirname, '..', 'uploads', 'certificados');
const outputFile = path.join(outputDir, 'kipu-dev.p12');

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🔐 Generando certificado de desarrollo para KIPU...\n');

// 1. Generar par de claves RSA 2048
console.log('  [1/4] Generando clave RSA 2048...');
const keys = forge.pki.rsa.generateKeyPair(2048);

// 2. Crear certificado X.509
console.log('  [2/4] Creando certificado autofirmado...');
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';

// Vigencia: 2 años desde hoy
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 2);

const attrs = [
  { name: 'commonName', value: 'KIPU DESARROLLO - PRUEBAS SRI' },
  { name: 'organizationName', value: 'KIPU EC' },
  { shortName: 'C', value: 'EC' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: 'basicConstraints', cA: false },
  {
    name: 'keyUsage',
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  },
  {
    name: 'extKeyUsage',
    clientAuth: true,
    emailProtection: true
  }
]);

// Firmar con SHA1 (requisito SRI)
cert.sign(keys.privateKey, forge.md.sha1.create());

console.log(`     CN: ${cert.subject.getField('CN').value}`);
console.log(`     Válido hasta: ${cert.validity.notAfter.toISOString().split('T')[0]}`);

// 3. Crear PKCS#12
console.log('  [3/4] Creando archivo .p12...');
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
  keys.privateKey,
  [cert],
  password,
  {
    algorithm: '3des',
    friendlyName: 'KIPU Development Certificate',
    generateLocalKeyId: true
  }
);

const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

// 4. Guardar archivo
console.log('  [4/4] Guardando archivo...');
fs.writeFileSync(outputFile, p12Der, 'binary');

console.log(`\n✅ Certificado de desarrollo generado exitosamente:`);
console.log(`   📁 Archivo: ${outputFile}`);
console.log(`   🔑 Contraseña: ${password}`);
console.log(`\n⚠️  Este certificado NO es válido para el SRI. Solo para desarrollo local.`);
console.log(`   Para pruebas reales, usa un certificado emitido por una CA autorizada.\n`);