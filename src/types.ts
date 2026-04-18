import type { CSSProperties } from "react";

export interface SignaturePadHandle {
    clear: () => void; // 캔버스를 지운다.
    hasSignature: () => boolean; // 서명 여부를 반환한다.
    toDataUrl: (type?: string, quality?: number) => string | null; // 현재 서명을 이미지로 반환한다.
    toBlob: (type?: string, quality?: number) => Promise<Blob | null>; // 현재 서명을 Blob으로 반환한다.
    exportEncrypted: (
        options: SignatureEncryptionOptions,
    ) => Promise<EncryptedSignaturePayload | null>; // 현재 서명을 암호화 페이로드로 반환한다.
}

export interface SignatureEncryptionOptions {
    key: CryptoKey; // 암호화에 사용할 AES-GCM 키다.
    aad?: BufferSource; // 추가 인증 데이터다.
    type?: string; // 직렬화할 이미지 타입이다.
    quality?: number; // 이미지 품질이다.
}

export interface SignatureDecryptionOptions {
    key: CryptoKey; // 복호화에 사용할 AES-GCM 키다.
    aad?: BufferSource; // 추가 인증 데이터다.
}

export interface EncryptedSignaturePayload {
    version: 1; // 페이로드 버전이다.
    alg: "AES-GCM"; // 암호 알고리즘이다.
    iv: string; // base64 인코딩된 초기화 벡터다.
    ciphertext: string; // base64 인코딩된 암호문이다.
    mimeType: string; // 원본 이미지 MIME 타입이다.
}

export interface EncryptedSignatureViewerProps {
    payload: EncryptedSignaturePayload | null; // 복호화할 암호화 서명 페이로드다.
    decryptionKey: CryptoKey | null; // 복호화에 사용할 AES-GCM 키다.
    aad?: BufferSource; // 추가 인증 데이터다.
    alt?: string; // 이미지 대체 텍스트다.
    className?: string; // 래퍼 클래스명이다.
    style?: CSSProperties; // 래퍼 인라인 스타일이다.
    imageStyle?: CSSProperties; // 이미지 인라인 스타일이다.
    emptyText?: string; // 빈 상태 안내 문구다.
    errorText?: string; // 오류 상태 안내 문구다.
}

export interface SignaturePadProps {
    minHeight?: number; // 최소 높이다.
    placeholder?: string; // 안내 문구다.
    placeholderStyle?: CSSProperties; // 안내 문구 스타일이다.
    cursor?: CSSProperties["cursor"]; // 입력 영역 커서다.
    lineWidth?: number; // 기본 선 굵기(px)다.
    maxStrokeWidth?: number; // 가변 굵기 사용 시 최대 선 굵기(px)다.
    enableVariableLineWidth?: boolean; // 속도 기반 가변 굵기 사용 여부다.
    minStrokeDistance?: number; // 새 점을 반영하기 위한 최소 이동 거리다.
    strokeStyle?: string; // 선 색상이다.
    backgroundColor?: string; // 배경 색상이다.
    disabledColor?: string; // 비활성 오버레이 색상이다.
    initialDataUrl?: string; // 초기 서명 이미지다.
    className?: string; // 래퍼 클래스명이다.
    style?: CSSProperties; // 래퍼 인라인 스타일이다.
    canvasStyle?: CSSProperties; // 캔버스 인라인 스타일이다.
    disabled?: boolean; // 입력 비활성화 여부다.
    readOnly?: boolean; // 읽기 전용 여부다.
    onSignatureStateChange?: (hasSignature: boolean) => void; // 서명 여부 변경 핸들러다.
    onChange?: (dataUrl: string | null) => void; // 서명 결과 변경 핸들러다.
}

export interface SignaturePoint {
    x: number; // x 좌표다.
    y: number; // y 좌표다.
}
