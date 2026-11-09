export interface ConceptoTicket {
  numero: number;
  descripcion: string;
  claveSat: string;
  unidad: string;
  cantidad: number;
  precio: number;
  importe: number;
  iva: number;
}

export interface TicketInfo {
  serie: string;
  folio: string;
  monto: number;
  fecha: string;
  sucursal: string;
  subtotal: number;
  iva: number;
  conceptos: ConceptoTicket[];
}

export interface ClienteFiscal {
  rfc: string;
  razonSocial: string;
  direccion: string;
  noExterior: string;
  noInterior?: string;
  colonia: string;
  cp: string;
  municipio: string;
  ciudad?: string;
  estado: string;
  regimenFiscal: string;
  email: string;
  telefono: string;
  formaPago?: string;
  usoCfdi?: string;
}

export interface FacturaGenerada {
  uuid: string;
  serie: string;
  folioFactura: string;
  fechaTimbrado: string;
  ticket: TicketInfo;
  receptor: ClienteFiscal;
  regimenFiscal: string;
  usoCfdi: string;
  formaPago: string;
  subtotal: number;
  iva: number;
  total: number;
  selloSat: string;
  selloCfd: string;
  noCertificadoSat: string;
}

const DEFAULT_RFCS: ClienteFiscal[] = [
  {
    rfc: "XAXX010101000",
    razonSocial: "PUBLICO EN GENERAL",
    direccion: "Av. Hidalgo",
    noExterior: "100",
    colonia: "Centro",
    cp: "27000",
    municipio: "Torreón",
    ciudad: "Torreón",
    estado: "Coahuila",
    regimenFiscal: "616",
    email: "facturacion@ventio.com.mx",
    telefono: "8711000000",
    formaPago: "01",
    usoCfdi: "S01",
  },
  {
    rfc: "VEN240101ABC",
    razonSocial: "VENTIO TECNOLOGIAS APLICADAS S.A. DE C.V.",
    direccion: "Blvd. Independencia",
    noExterior: "2100",
    colonia: "Navarro",
    cp: "27010",
    municipio: "Torreón",
    ciudad: "Torreón",
    estado: "Coahuila",
    regimenFiscal: "601",
    email: "contabilidad@ventio.com.mx",
    telefono: "8717123456",
    formaPago: "04",
    usoCfdi: "G03",
  },
  {
    rfc: "IOP010820NAA",
    razonSocial: "INTERACCION OPERATIVA S.A. DE C.V.",
    direccion: "Calzada Cuauhtémoc",
    noExterior: "1450",
    colonia: "San Isidro",
    cp: "27100",
    municipio: "Torreón",
    ciudad: "Torreón",
    estado: "Coahuila",
    regimenFiscal: "601",
    email: "contacto@interaccionoperativa.com",
    telefono: "8712223344",
    formaPago: "03",
    usoCfdi: "G03",
  },
];

export const facturacionService = {
  buscarTicket: async (
    serie: string,
    folio: string,
    monto: number
  ): Promise<TicketInfo> => {
    await new Promise((res) => setTimeout(res, 600));

    const total = Number(monto);
    if (!total || total <= 0) {
      throw new Error("El monto del ticket debe ser mayor a 0.");
    }

    const subtotal = Number((total / 1.16).toFixed(2));
    const iva = Number((total - subtotal).toFixed(2));

    const hoy = new Date();
    const fechaFormateada = hoy.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const conceptos: ConceptoTicket[] = [
      {
        numero: 1,
        descripcion: "Consumo de Alimentos y Bebidas",
        claveSat: "90101501",
        unidad: "E48",
        cantidad: 1,
        precio: subtotal,
        importe: subtotal,
        iva,
      },
    ];

    return {
      serie: (serie || "TCK").toUpperCase(),
      folio: folio.trim(),
      monto: total,
      fecha: fechaFormateada,
      sucursal: "Sucursal 1 - Matriz Ventio",
      subtotal,
      iva,
      conceptos,
    };
  },

  buscarRfc: async (rfc: string): Promise<ClienteFiscal | null> => {
    await new Promise((res) => setTimeout(res, 400));
    const limpio = rfc.trim().toUpperCase();

    try {
      const stored = localStorage.getItem("ventio_catalogo_rfcs");
      const catalogo: ClienteFiscal[] = stored ? JSON.parse(stored) : [];
      const match = catalogo.find((c) => c.rfc.toUpperCase() === limpio);
      if (match) return match;
    } catch {}

    const defaultMatch = DEFAULT_RFCS.find((c) => c.rfc.toUpperCase() === limpio);
    if (defaultMatch) return defaultMatch;

    try {
      const userStored = localStorage.getItem("facturacion_user");
      if (userStored) {
        const u = JSON.parse(userStored);
        if (u.rfc && u.rfc.toUpperCase() === limpio) {
          return {
            rfc: u.rfc.toUpperCase(),
            razonSocial: u.nombre || "CLIENTE REGISTRADO",
            direccion: u.direccion || "Domicilio Conocido",
            noExterior: u.noExterior || "S/N",
            noInterior: u.noInterior || "",
            colonia: u.colonia || "Centro",
            cp: u.cp || "27000",
            municipio: u.municipio || "Torreón",
            ciudad: u.ciudad || "Torreón",
            estado: u.estado || "Coahuila",
            regimenFiscal: u.regimenFiscal || "612",
            email: u.email || "",
            telefono: u.telefono || "",
            formaPago: u.formaPago || "01",
            usoCfdi: u.usoCfdi || "G03",
          };
        }
      }
    } catch {}

    return null;
  },

  guardarNuevoRfc: async (cliente: ClienteFiscal): Promise<ClienteFiscal> => {
    await new Promise((res) => setTimeout(res, 500));
    const normalizado: ClienteFiscal = {
      ...cliente,
      rfc: cliente.rfc.trim().toUpperCase(),
      razonSocial: cliente.razonSocial.trim().toUpperCase(),
      email: cliente.email.trim().toLowerCase(),
    };

    try {
      const stored = localStorage.getItem("ventio_catalogo_rfcs");
      const catalogo: ClienteFiscal[] = stored ? JSON.parse(stored) : [];
      const index = catalogo.findIndex((c) => c.rfc === normalizado.rfc);
      if (index >= 0) {
        catalogo[index] = normalizado;
      } else {
        catalogo.push(normalizado);
      }
      localStorage.setItem("ventio_catalogo_rfcs", JSON.stringify(catalogo));
    } catch {}

    return normalizado;
  },

  generarFactura: async (
    ticket: TicketInfo,
    receptor: ClienteFiscal,
    regimenFiscal: string,
    usoCfdi: string,
    formaPago: string
  ): Promise<FacturaGenerada> => {
    await new Promise((res) => setTimeout(res, 900));

    const randomHex = (len: number) =>
      Array.from({ length: len }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("").toUpperCase();

    const uuid = `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-A${randomHex(3)}-${randomHex(12)}`;
    const folioFactura = String(Math.floor(10000 + Math.random() * 90000));
    const now = new Date();
    const fechaTimbrado = now.toISOString().replace("Z", "");

    const selloSat = randomHex(64);
    const selloCfd = randomHex(64);
    const noCertificadoSat = "00001000000504465028";

    return {
      uuid,
      serie: "VEN",
      folioFactura,
      fechaTimbrado,
      ticket,
      receptor: {
        ...receptor,
        regimenFiscal,
        usoCfdi,
        formaPago,
      },
      regimenFiscal,
      usoCfdi,
      formaPago,
      subtotal: ticket.subtotal,
      iva: ticket.iva,
      total: ticket.monto,
      selloSat,
      selloCfd,
      noCertificadoSat,
    };
  },

  descargarXml: (factura: FacturaGenerada) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="4.0" Serie="${factura.serie}" Folio="${factura.folioFactura}" Fecha="${factura.fechaTimbrado}" FormaPago="${factura.formaPago}" SubTotal="${factura.subtotal.toFixed(2)}" Moneda="MXN" Total="${factura.total.toFixed(2)}" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="27000" Sello="${factura.selloCfd}">
  <cfdi:Emisor Rfc="VEN240101ABC" Nombre="VENTIO FACTURACION S.A. DE C.V." RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${factura.receptor.rfc}" Nombre="${factura.receptor.razonSocial}" DomicilioFiscalReceptor="${factura.receptor.cp}" RegimenFiscalReceptor="${factura.regimenFiscal}" UsoCFDI="${factura.usoCfdi}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="90101501" Cantidad="1.00" ClaveUnidad="E48" Unidad="Servicio" Descripcion="Consumo de Alimentos y Bebidas (Ticket ${factura.ticket.serie}-${factura.ticket.folio})" ValorUnitario="${factura.subtotal.toFixed(2)}" Importe="${factura.subtotal.toFixed(2)}" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${factura.subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${factura.iva.toFixed(2)}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${factura.iva.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${factura.subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${factura.iva.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="1.1" UUID="${factura.uuid}" FechaTimbrado="${factura.fechaTimbrado}" RfcProvCertif="SAT970701NN3" SelloCFD="${factura.selloCfd}" NoCertificadoSAT="${factura.noCertificadoSat}" SelloSAT="${factura.selloSat}"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_${factura.serie}_${factura.folioFactura}_${factura.receptor.rfc}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  descargarPdf: (factura: FacturaGenerada) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Factura ${factura.serie}-${factura.folioFactura}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 24px; font-size: 13px; line-height: 1.4; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 2px solid #010080; }
    .brand { font-size: 24px; font-weight: 900; color: #010080; margin: 0; }
    .subbrand { font-size: 11px; color: #0b5ed7; font-weight: 700; text-transform: uppercase; }
    .folio-box { text-align: right; background: #eef5ff; padding: 10px 16px; border-radius: 8px; border: 1px solid #b6d4fe; }
    .folio-box strong { font-size: 16px; color: #010080; display: block; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #010080; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #010080; color: white; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .totals { width: 280px; margin-left: auto; margin-top: 12px; }
    .totals table td { border: none; padding: 4px 8px; }
    .total-row { font-size: 15px; font-weight: 900; color: #010080; background: #eef5ff; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #64748b; word-break: break-all; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; background: #0b5ed7; color: white; font-size: 10px; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; text-align: right;">
    <button onclick="window.print()" style="background:#010080; color:white; border:none; padding:8px 16px; border-radius:6px; font-weight:bold; cursor:pointer;">Imprimir / Guardar como PDF</button>
  </div>
  <div class="header">
    <div>
      <h1 class="brand">VENTIO</h1>
      <div class="subbrand">Facturación Electrónica CFDI 4.0</div>
      <div style="font-size: 11px; margin-top: 4px; color: #475569;">
        <strong>VENTIO FACTURACION S.A. DE C.V.</strong><br/>
        RFC: VEN240101ABC | Régimen Fiscal: 601 General de Ley Personas Morales<br/>
        Lugar de Expedición: 27000 Torreón, Coahuila
      </div>
    </div>
    <div class="folio-box">
      <span class="badge">INGRESO</span>
      <strong>${factura.serie}-${factura.folioFactura}</strong>
      <div style="font-size: 10px; color: #475569; margin-top: 4px;">UUID / Folio Fiscal:</div>
      <div style="font-size: 9px; font-weight: bold; color: #010080;">${factura.uuid}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Fecha: ${factura.fechaTimbrado}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Datos del Receptor / Cliente</div>
      <div><strong>${factura.receptor.razonSocial}</strong></div>
      <div>RFC: <strong>${factura.receptor.rfc}</strong></div>
      <div>Domicilio Fiscal CP: ${factura.receptor.cp}</div>
      <div>Régimen Fiscal: ${factura.regimenFiscal}</div>
      <div>Uso de CFDI: ${factura.usoCfdi}</div>
    </div>
    <div class="card">
      <div class="card-title">Datos del Comprobante y Ticket</div>
      <div>Ticket Origen: <strong>${factura.ticket.serie}-${factura.ticket.folio}</strong></div>
      <div>Sucursal: ${factura.ticket.sucursal}</div>
      <div>Fecha de Consumo: ${factura.ticket.fecha}</div>
      <div>Forma de Pago: ${factura.formaPago}</div>
      <div>Método de Pago: PUE - Pago en una sola exhibición</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Clave SAT</th>
        <th>Cant</th>
        <th>Unidad</th>
        <th>Descripción</th>
        <th style="text-align: right;">P. Unitario</th>
        <th style="text-align: right;">IVA (16%)</th>
        <th style="text-align: right;">Importe</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>90101501</td>
        <td>1.00</td>
        <td>E48</td>
        <td>Consumo de Alimentos y Bebidas (Ticket ${factura.ticket.serie}-${factura.ticket.folio})</td>
        <td style="text-align: right;">$${factura.subtotal.toFixed(2)}</td>
        <td style="text-align: right;">$${factura.iva.toFixed(2)}</td>
        <td style="text-align: right;"><strong>$${factura.subtotal.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td style="text-align: right;">$${factura.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>IVA 16%:</td>
        <td style="text-align: right;">$${factura.iva.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL:</td>
        <td style="text-align: right;">$${factura.total.toFixed(2)} MXN</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <div><strong>Cadena Original del Complemento de Certificación Digital del SAT:</strong></div>
    <div>||1.1|${factura.uuid}|${factura.fechaTimbrado}|SAT970701NN3|${factura.selloCfd.substring(0, 32)}...||</div>
    <div style="margin-top: 6px;"><strong>Sello Digital del CFDI:</strong> ${factura.selloCfd.substring(0, 48)}...</div>
    <div style="margin-top: 6px;"><strong>Sello del SAT:</strong> ${factura.selloSat.substring(0, 48)}...</div>
    <div style="margin-top: 8px; text-align: center; font-weight: bold;">Este documento es una representación impresa de un CFDI versión 4.0</div>
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  },
};

export default facturacionService;

