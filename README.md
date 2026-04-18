# @ehfuse/signature-pad

React 기반 서명 입력 컴포넌트 패키지입니다. 기본 출력은 투명 배경 PNG이고, 필요할 때 배경색과 AES-GCM 암호화 export를 함께 사용할 수 있습니다.

상세 문서는 아래를 확인하세요.

- [시작하기](./docs/ko/getting-started.md)
- [API](./docs/ko/api.md)
- [예제](./docs/ko/example.md)

## Signature

```tsx
import {
    EncryptedSignatureViewer,
    SignaturePad,
    decryptSignaturePayload,
    type EncryptedSignaturePayload,
    type SignaturePadHandle,
    type SignaturePadProps,
} from "@ehfuse/signature-pad";
```

```ts
interface SignaturePadHandle {
    clear(): void;
    hasSignature(): boolean;
    toDataUrl(type?: string, quality?: number): string | null;
    toBlob(type?: string, quality?: number): Promise<Blob | null>;
    exportEncrypted(
        options: SignatureEncryptionOptions,
    ): Promise<EncryptedSignaturePayload | null>;
}
```
