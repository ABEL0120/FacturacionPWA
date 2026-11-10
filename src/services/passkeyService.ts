import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const passkeyService = {
  isSupported: (): boolean => {
    return browserSupportsWebAuthn();
  },

  isPlatformAvailable: async (): Promise<boolean> => {
    if (!browserSupportsWebAuthn()) return false;
    try {
      return await platformAuthenticatorIsAvailable();
    } catch {
      return false;
    }
  },

  hasSavedPasskey: (): boolean => {
    try {
      return !!localStorage.getItem("passkey_registered");
    } catch {
      return false;
    }
  },

  getSavedPasskeyData: (): {
    usuario: string;
    nombre: string;
    credentialId: string;
    numeroCliente?: number;
    rfc?: string;
    telefono?: string;
    moduloDestino?: string;
  } | null => {
    try {
      const data = localStorage.getItem("passkey_registered");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  registrarPasskey: async (
    usuario: string,
    nombre: string,
    extra?: {
      numeroCliente?: number;
      rfc?: string;
      telefono?: string;
      moduloDestino?: string;
    },
  ): Promise<{ credentialId: string; publicKey?: string }> => {
    if (!browserSupportsWebAuthn()) {
      throw new Error("Tu navegador o dispositivo no soporta Passkeys o WebAuthn.");
    }

    const randomBuffer = new Uint8Array(32);
    crypto.getRandomValues(randomBuffer);
    const challengeBase64 = bufferToBase64Url(randomBuffer.buffer);

    const userIdBytes = new TextEncoder().encode(usuario);
    const userIdBase64 = bufferToBase64Url(userIdBytes.buffer);

    const optionsJSON: PublicKeyCredentialCreationOptionsJSON = {
      challenge: challengeBase64,
      rp: {
        name: "Facturación Ventio",
        id: window.location.hostname,
      },
      user: {
        id: userIdBase64,
        name: usuario,
        displayName: nombre || usuario,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      authenticatorSelection: {
        userVerification: "preferred",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    };

    const registrationResponse = await startRegistration({ optionsJSON });

    const credentialData = {
      credentialId: registrationResponse.id,
      usuario,
      nombre,
      numeroCliente: extra?.numeroCliente,
      rfc: extra?.rfc,
      telefono: extra?.telefono,
      moduloDestino: extra?.moduloDestino,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("passkey_registered", JSON.stringify(credentialData));

    return {
      credentialId: registrationResponse.id,
      publicKey: registrationResponse.response.publicKey,
    };
  },

  autenticarPasskey: async (): Promise<{
    credentialId: string;
    usuario: string;
    nombre: string;
    numeroCliente?: number;
    rfc?: string;
    telefono?: string;
    moduloDestino?: string;
  }> => {
    if (!browserSupportsWebAuthn()) {
      throw new Error("Tu dispositivo no soporta verificación mediante Passkeys.");
    }

    const randomBuffer = new Uint8Array(32);
    crypto.getRandomValues(randomBuffer);
    const challengeBase64 = bufferToBase64Url(randomBuffer.buffer);

    const optionsJSON: PublicKeyCredentialRequestOptionsJSON = {
      challenge: challengeBase64,
      timeout: 60000,
      userVerification: "preferred",
      rpId: window.location.hostname,
    };

    const authResponse = await startAuthentication({ optionsJSON });

    const saved = passkeyService.getSavedPasskeyData();
    const usuario = saved?.usuario || "usuario_passkey@ventio.com";
    const nombre = saved?.nombre || "Usuario Passkey";

    return {
      credentialId: authResponse.id,
      usuario,
      nombre,
      numeroCliente: saved?.numeroCliente,
      rfc: saved?.rfc,
      telefono: saved?.telefono,
      moduloDestino: saved?.moduloDestino,
    };
  },
};

