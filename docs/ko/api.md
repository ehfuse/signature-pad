# API

## 목차

- [컴포넌트](#컴포넌트)
- [핸들](#핸들)
- [타입](#타입)
- [암호화 유틸](#암호화-유틸)

## 컴포넌트

### SignaturePad

| 항목                      | 타입                                | 설명                                                     |
| ------------------------- | ----------------------------------- | -------------------------------------------------------- |
| `minHeight`               | `number`                            | 캔버스 최소 높이입니다.                                  |
| `placeholder`             | `string`                            | 빈 상태 안내 문구입니다.                                 |
| `placeholderStyle`        | [`CSSProperties`](#cssproperties)   | 안내 문구 스타일입니다.                                  |
| `cursor`                  | `CSSProperties["cursor"]`           | 입력 중 커서입니다.                                      |
| `lineWidth`               | `number`                            | 기본 선 굵기입니다.                                      |
| `maxStrokeWidth`          | `number`                            | 가변 굵기 최대값입니다.                                  |
| `enableVariableLineWidth` | `boolean`                           | 속도 기반 굵기 변화를 켤지 결정합니다.                   |
| `minStrokeDistance`       | `number`                            | 최소 점 간격입니다.                                      |
| `strokeStyle`             | `string`                            | 선 색상입니다.                                           |
| `backgroundColor`         | `string`                            | export 전 캔버스를 채울 배경색입니다. 비우면 투명입니다. |
| `disabledColor`           | `string`                            | 비활성 오버레이 색상입니다.                              |
| `initialDataUrl`          | `string`                            | 초기 서명 이미지입니다.                                  |
| `className`               | `string`                            | 래퍼 클래스명입니다.                                     |
| `style`                   | [`CSSProperties`](#cssproperties)   | 래퍼 인라인 스타일입니다.                                |
| `canvasStyle`             | [`CSSProperties`](#cssproperties)   | 캔버스 인라인 스타일입니다.                              |
| `disabled`                | `boolean`                           | 비활성 상태입니다.                                       |
| `readOnly`                | `boolean`                           | 읽기 전용 상태입니다.                                    |
| `onSignatureStateChange`  | `(hasSignature: boolean) => void`   | 서명 여부 변경 콜백입니다.                               |
| `onChange`                | `(dataUrl: string \| null) => void` | PNG Data URL 변경 콜백입니다.                            |

### EncryptedSignatureViewer

| 항목            | 타입                                                                | 설명                           |
| --------------- | ------------------------------------------------------------------- | ------------------------------ |
| `payload`       | [`EncryptedSignaturePayload`](#encryptedsignaturepayload) `\| null` | 복호화할 암호문 payload입니다. |
| `decryptionKey` | `CryptoKey \| null`                                                 | 복호화 키입니다.               |
| `aad`           | `BufferSource`                                                      | 추가 인증 데이터입니다.        |
| `alt`           | `string`                                                            | 이미지 대체 텍스트입니다.      |
| `className`     | `string`                                                            | 래퍼 클래스명입니다.           |
| `style`         | [`CSSProperties`](#cssproperties)                                   | 래퍼 인라인 스타일입니다.      |
| `imageStyle`    | [`CSSProperties`](#cssproperties)                                   | 이미지 스타일입니다.           |
| `emptyText`     | `string`                                                            | 빈 상태 문구입니다.            |
| `errorText`     | `string`                                                            | 오류 상태 문구입니다.          |

## 핸들

### SignaturePadHandle

| 메서드            | 시그니처                                                                                                                                           | 설명                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `clear`           | `() => void`                                                                                                                                       | 현재 서명을 지웁니다.                     |
| `hasSignature`    | `() => boolean`                                                                                                                                    | 서명 존재 여부를 반환합니다.              |
| `toDataUrl`       | `(type?: string, quality?: number) => string \| null`                                                                                              | 현재 서명을 Data URL로 반환합니다.        |
| `toBlob`          | `(type?: string, quality?: number) => Promise<Blob \| null>`                                                                                       | 현재 서명을 Blob으로 반환합니다.          |
| `exportEncrypted` | `(options: [SignatureEncryptionOptions](#signatureencryptionoptions)) => Promise<[EncryptedSignaturePayload](#encryptedsignaturepayload) \| null>` | 현재 서명을 AES-GCM payload로 반환합니다. |

## 타입

### SignatureEncryptionOptions

| 필드      | 타입           | 설명                     |
| --------- | -------------- | ------------------------ |
| `key`     | `CryptoKey`    | AES-GCM 암호화 키입니다. |
| `aad`     | `BufferSource` | 추가 인증 데이터입니다.  |
| `type`    | `string`       | 이미지 MIME 타입입니다.  |
| `quality` | `number`       | 이미지 품질입니다.       |

### EncryptedSignaturePayload

| 필드         | 타입        | 설명                         |
| ------------ | ----------- | ---------------------------- |
| `version`    | `1`         | payload 버전입니다.          |
| `alg`        | `"AES-GCM"` | 알고리즘 이름입니다.         |
| `iv`         | `string`    | base64 초기화 벡터입니다.    |
| `ciphertext` | `string`    | base64 암호문입니다.         |
| `mimeType`   | `string`    | 원본 이미지 MIME 타입입니다. |

### CSSProperties

React의 `CSSProperties` 타입을 의미합니다.

## 암호화 유틸

### decryptSignaturePayload

```ts
function decryptSignaturePayload(
    payload: EncryptedSignaturePayload,
    options: SignatureDecryptionOptions,
): Promise<Blob>;
```

암호화 payload를 다시 이미지 Blob으로 복호화합니다.

### encryptSignatureBlob

```ts
function encryptSignatureBlob(
    blob: Blob,
    options: SignatureEncryptionOptions,
): Promise<EncryptedSignaturePayload>;
```

임의의 이미지 Blob을 직접 AES-GCM payload로 암호화합니다.

## 관련 문서

- [시작하기](./getting-started.md)
- [예제](./example.md)
- [README](../../README.md)
