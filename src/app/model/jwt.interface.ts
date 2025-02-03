export interface IJwt {
  jti: string,
  correo: string,
  sub: string,
  iss: string,
  iat: number,
  exp: number
}
