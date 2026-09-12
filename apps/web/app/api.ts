// Estas rutas permanecen relativas al host actual: localhost, IP local o dominio final.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const apiUrl = `${basePath}/api/v1`;
