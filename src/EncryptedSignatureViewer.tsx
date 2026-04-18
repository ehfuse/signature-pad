import { useEffect, useRef, useState } from "react";
import type { EncryptedSignatureViewerProps } from "./types";
import { decryptSignaturePayload } from "./internal/crypto";

/** 암호화 서명 뷰어를 렌더링한다. */
export function EncryptedSignatureViewer({
    payload,
    decryptionKey,
    aad,
    alt = "Encrypted signature",
    className,
    style,
    imageStyle,
    emptyText = "암호화된 서명이 없습니다.",
    errorText = "서명 복호화에 실패했습니다.",
}: EncryptedSignatureViewerProps) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        let isDisposed = false;

        /** 현재 object URL을 해제한다. */
        const revokeObjectUrl = () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };

        if (!payload || !decryptionKey) {
            revokeObjectUrl();
            setObjectUrl(null);
            setHasError(false);
            return undefined;
        }

        /** 암호화된 서명 이미지를 복호화한다. */
        const decrypt = async () => {
            try {
                const blob = await decryptSignaturePayload(payload, {
                    key: decryptionKey,
                    aad,
                });

                if (isDisposed) {
                    return;
                }

                const createdObjectUrl = URL.createObjectURL(blob);
                revokeObjectUrl();
                objectUrlRef.current = createdObjectUrl;
                setObjectUrl(createdObjectUrl);
                setHasError(false);
            } catch {
                if (!isDisposed) {
                    revokeObjectUrl();
                    setObjectUrl(null);
                    setHasError(true);
                }
            }
        };

        void decrypt();

        return () => {
            isDisposed = true;
            revokeObjectUrl();
        };
    }, [aad, decryptionKey, payload]);

    if (!payload || !decryptionKey) {
        return (
            <div className={className} style={style}>
                {emptyText}
            </div>
        );
    }

    if (hasError || !objectUrl) {
        return (
            <div className={className} style={style}>
                {errorText}
            </div>
        );
    }

    return (
        <div className={className} style={style}>
            <img
                src={objectUrl}
                alt={alt}
                style={{ display: "block", maxWidth: "100%", ...imageStyle }}
            />
        </div>
    );
}
