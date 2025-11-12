// src/utils/keycloak.ts
import Keycloak from 'keycloak-js';

// Kiểm tra xem mã có đang chạy trên client hay không
const isClient = typeof window !== 'undefined';

const keycloak = isClient ? new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL! ,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
}) : ({} as Keycloak); // Trên server, trả về một đối tượng rỗng

export default keycloak;