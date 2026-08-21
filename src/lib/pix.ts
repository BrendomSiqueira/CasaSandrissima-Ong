// Utility to generate official Brazilian Pix static copy-and-paste payload (BR Code)
// Compliant with EMV Co specifications and Banco Central do Brasil

function crc16(str: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  const bytes = new TextEncoder().encode(str);
  
  for (const b of bytes) {
    for (let i = 0; i < 8; i++) {
      const bit = ((b >> (7 - i) & 1) === 1);
      const c15 = ((crc >> 15 & 1) === 1);
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }
  
  crc &= 0xFFFF;
  let hex = crc.toString(16).toUpperCase();
  while (hex.length < 4) hex = '0' + hex;
  return hex;
}

function pad(length: number): string {
  return length.toString().padStart(2, '0');
}

/**
 * Generates the BR Code string for Pix Static QR Code
 * @param key CNPJ/CPF/Email/Phone key (unformatted internally)
 * @param amount Optional transaction value (e.g. 50.00)
 * @param merchantName Receiver Name (Max 25 characters, default CASA SANDRISSIMA)
 * @param merchantCity Receiver City (Max 15 characters, default FRANCA)
 */
export function generatePixPayload(
  key: string, 
  amount?: number, 
  merchantName = "CASA SANDRISSIMA", 
  merchantCity = "FRANCA"
): string {
  // Normalize the CNPJ by keeping only digits
  const normalizedKey = key.replace(/[^a-zA-Z0-9]/g, '');
  
  const gui = "0014br.gov.bcb.pix";
  const keyTag = `01${pad(normalizedKey.length)}${normalizedKey}`;
  const merchantAccountInfo = `26${pad(gui.length + keyTag.length)}${gui}${keyTag}`;
  
  let payload = `000201${merchantAccountInfo}520400005303986`;
  
  if (amount && amount > 0) {
    const amtStr = amount.toFixed(2);
    payload += `54${pad(amtStr.length)}${amtStr}`;
  }
  
  // Strip accents and map to uppercase to satisfy banking validation rules
  const cleanName = merchantName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 25)
    .toUpperCase();
    
  const cleanCity = merchantCity
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 15)
    .toUpperCase();
  
  payload += `5802BR`;
  payload += `59${pad(cleanName.length)}${cleanName}`;
  payload += `60${pad(cleanCity.length)}${cleanCity}`;
  payload += `62070503***`;
  payload += `6304`; // placeholder for CRC16 digits
  
  const checksum = crc16(payload);
  return payload + checksum;
}
