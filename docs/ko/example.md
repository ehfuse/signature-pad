# 예제

## 목차

- [기본 사용](#기본-사용)
- [투명 배경과 배경색](#투명-배경과-배경색)
- [AES-GCM 예제](#aes-gcm-예제)

## 기본 사용

패키지 내부 `example/` 앱은 아래 흐름을 한 화면에서 확인합니다.

- 서명 입력
- PNG Data URL 저장
- Blob 저장
- 초기 이미지 복원
- AES-GCM 키 생성
- 암호화 payload 생성
- 복호화 미리보기

개발 실행은 다음과 같습니다.

```bash
cd example
npm install
npm run dev
```

## 투명 배경과 배경색

기본값은 투명 배경입니다. 예제 앱에서는 `transparentBackground` 옵션이 켜져 있으면 투명으로 유지되고, 끄면 색상 선택기를 통해 배경색을 지정할 수 있습니다.

## AES-GCM 예제

예제 앱의 AES-GCM 섹션에서는 아래 데이터를 바로 확인할 수 있습니다.

- 생성된 raw key base64 값
- payload `version`
- payload `alg`
- payload `mimeType`
- payload `iv`
- payload `ciphertext` 미리보기와 전체 길이

암호화 예제 흐름은 다음과 같습니다.

```tsx
/** 현재 서명을 암호화한다. */
async function handleEncrypt(
    signatureRef: React.RefObject<SignaturePadHandle | null>,
    key: CryptoKey,
    aad: Uint8Array,
) {
    return signatureRef.current?.exportEncrypted({
        key,
        aad,
    });
}
```

## 관련 문서

- [시작하기](./getting-started.md)
- [API](./api.md)
- [README](../../README.md)
