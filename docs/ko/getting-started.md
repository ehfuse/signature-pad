# 시작하기

`@ehfuse/signature-pad`는 React 애플리케이션에서 서명 입력, PNG export, AES-GCM 암호화 export를 처리하기 위한 컴포넌트 패키지입니다.

## 설치

```bash
npm install @ehfuse/signature-pad
```

peer dependency로 `react`, `react-dom`이 필요합니다.

## 빠른 시작

```tsx
import { useRef } from "react";
import { SignaturePad, type SignaturePadHandle } from "@ehfuse/signature-pad";

/** 서명 예제를 렌더링한다. */
export function SignatureExample() {
    const signatureRef = useRef<SignaturePadHandle | null>(null);

    /** 현재 서명을 저장한다. */
    const handleSave = async () => {
        const dataUrl = signatureRef.current?.toDataUrl();
        const blob = await signatureRef.current?.toBlob();
        console.log(dataUrl, blob);
    };

    return (
        <>
            <SignaturePad
                ref={signatureRef}
                minHeight={220}
                placeholder="서명하세요"
                strokeStyle="#111827"
            />
            <button onClick={handleSave}>저장</button>
        </>
    );
}
```

## 배경색 동작

- 기본값은 투명 배경입니다.
- `backgroundColor`를 넘기면 해당 색으로 캔버스를 채운 뒤 export합니다.
- `toDataUrl()`와 `toBlob()` 기본 포맷은 PNG입니다.

## 암호화 export

암호화는 패키지가 키를 관리하지 않고, 소비처가 `CryptoKey`를 생성해 주입하는 구조입니다.

```tsx
/** AES-GCM 키를 생성한다. */
async function createKey() {
    return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
        "encrypt",
        "decrypt",
    ]);
}

/** 암호화 payload를 만든다. */
async function exportEncryptedSignature(
    signatureRef: React.RefObject<SignaturePadHandle | null>,
) {
    const key = await createKey();
    return signatureRef.current?.exportEncrypted({ key });
}
```

## 관련 문서

- [API](./api.md)
- [예제](./example.md)
- [README](../../README.md)
