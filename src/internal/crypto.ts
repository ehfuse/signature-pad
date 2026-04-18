import type {
    EncryptedSignaturePayload,
    SignatureDecryptionOptions,
    SignatureEncryptionOptions,
} from "../types";

const AES_GCM_ALGORITHM = "AES-GCM";
const AES_GCM_IV_LENGTH = 12;

/** 브라우저 Web Crypto 사용 가능 여부를 확인한다. */
function getSubtleCrypto() {
    if (!globalThis.crypto?.subtle) {
        throw new Error("Web Crypto API is not available in this environment.");
    }

    return globalThis.crypto.subtle;
}

/** Uint8Array를 base64 문자열로 변환한다. */
function encodeBase64(bytes: Uint8Array) {
    let binary = "";

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

/** base64 문자열을 Uint8Array로 변환한다. */
function decodeBase64(value: string) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

/** Blob을 Uint8Array로 변환한다. */
async function blobToBytes(blob: Blob) {
    return new Uint8Array(await blob.arrayBuffer());
}

/** AES-GCM 파라미터를 만든다. */
function createAesGcmParams(iv: Uint8Array, aad?: BufferSource) {
    return aad
        ? { name: AES_GCM_ALGORITHM, iv, additionalData: aad }
        : { name: AES_GCM_ALGORITHM, iv };
}

/** 키가 AES-GCM 암호화 용도인지 검증한다. */
function validateAesKey(key: CryptoKey) {
    if (key.algorithm.name !== AES_GCM_ALGORITHM) {
        throw new Error("Only AES-GCM CryptoKey values are supported.");
    }
}

/** Blob을 AES-GCM 페이로드로 암호화한다. */
export async function encryptSignatureBlob(
    blob: Blob,
    { key, aad }: SignatureEncryptionOptions,
): Promise<EncryptedSignaturePayload> {
    validateAesKey(key);

    const subtle = getSubtleCrypto();
    const iv = globalThis.crypto.getRandomValues(
        new Uint8Array(AES_GCM_IV_LENGTH),
    );
    const bytes = await blobToBytes(blob);
    const ciphertext = await subtle.encrypt(
        createAesGcmParams(iv, aad),
        key,
        bytes,
    );

    return {
        version: 1,
        alg: AES_GCM_ALGORITHM,
        iv: encodeBase64(iv),
        ciphertext: encodeBase64(new Uint8Array(ciphertext)),
        mimeType: blob.type || "image/png",
    };
}

/** 암호화 서명 페이로드를 Blob으로 복호화한다. */
export async function decryptSignaturePayload(
    payload: EncryptedSignaturePayload,
    { key, aad }: SignatureDecryptionOptions,
): Promise<Blob> {
    validateAesKey(key);

    if (payload.alg !== AES_GCM_ALGORITHM) {
        throw new Error(
            `Unsupported signature payload algorithm: ${payload.alg}`,
        );
    }

    const subtle = getSubtleCrypto();
    const iv = decodeBase64(payload.iv);
    const ciphertext = decodeBase64(payload.ciphertext);
    const decrypted = await subtle.decrypt(
        createAesGcmParams(iv, aad),
        key,
        ciphertext,
    );

    return new Blob([decrypted], {
        type: payload.mimeType || "image/png",
    });
}
