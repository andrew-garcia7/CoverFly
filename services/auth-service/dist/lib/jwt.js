import jwt from "jsonwebtoken";
import { envString, envNumber } from "@coverfly/config";
export function signAccessToken(claims) {
    const privateKey = envString("JWT_PRIVATE_KEY_PEM", "dev-private");
    const issuer = envString("JWT_ISSUER", "coverfly");
    const audience = envString("JWT_AUDIENCE", "coverfly-web");
    const ttl = envNumber("JWT_ACCESS_TOKEN_TTL_SECONDS", 900);
    return jwt.sign(claims, privateKey, {
        algorithm: privateKey.includes("BEGIN") ? "RS256" : "HS256",
        expiresIn: ttl,
        issuer,
        audience
    });
}
export function signRefreshToken(userId) {
    const privateKey = envString("JWT_PRIVATE_KEY_PEM", "dev-private");
    const issuer = envString("JWT_ISSUER", "coverfly");
    const audience = envString("JWT_AUDIENCE", "coverfly-web");
    const ttl = envNumber("JWT_REFRESH_TOKEN_TTL_SECONDS", 1209600);
    return jwt.sign({ sub: userId, typ: "refresh" }, privateKey, {
        algorithm: privateKey.includes("BEGIN") ? "RS256" : "HS256",
        expiresIn: ttl,
        issuer,
        audience
    });
}
export function verifyToken(token) {
    const publicKey = envString("JWT_PUBLIC_KEY_PEM", envString("JWT_PRIVATE_KEY_PEM", "dev-private"));
    const issuer = envString("JWT_ISSUER", "coverfly");
    const audience = envString("JWT_AUDIENCE", "coverfly-web");
    return jwt.verify(token, publicKey, {
        algorithms: [publicKey.includes("BEGIN") ? "RS256" : "HS256"],
        issuer,
        audience
    });
}
