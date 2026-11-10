export const crearTokenSimulado = (
  payload: Record<string, unknown>,
): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  );
  const signature = btoa("jwt_secret_ventio_token");
  return `${header}.${body}.${signature}`;
};

