import { useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import {
    EncryptedSignatureViewer,
    SignaturePad,
    type EncryptedSignaturePayload,
    type SignaturePadHandle,
} from "@ehfuse/signature-pad";
import { ActionToolbar } from "./basic/ActionToolbar";
import { InfoCards } from "./basic/InfoCards";
import { OptionsPanel } from "./basic/OptionsPanel";
import { createDefaultOptions, type ExampleOptions } from "./basic/types";

const encryptionLabelBytes = new TextEncoder().encode(
    "@ehfuse/signature-pad-example",
);

/** ArrayBuffer를 base64 문자열로 변환한다. */
function encodeBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary);
}

/** 제목과 값을 세로로 렌더링한다. */
function DetailRow({ title, value }: { title: string; value: string }) {
    return (
        <Stack spacing={0.5}>
            <Typography
                sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "text.secondary",
                    letterSpacing: "0.06em",
                }}
            >
                {title}
            </Typography>
            <Typography
                sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    wordBreak: "break-all",
                }}
            >
                {value}
            </Typography>
        </Stack>
    );
}

/** 암호문 미리보기 문자열을 만든다. */
function getCiphertextPreview(ciphertext: string | undefined) {
    if (!ciphertext) {
        return "empty";
    }

    const previewLength = 96;
    return ciphertext.length > previewLength
        ? `${ciphertext.slice(0, previewLength)}...`
        : ciphertext;
}

/** 기본 사용 예제를 렌더링한다. */
export function BasicPage() {
    const signaturePadRef = useRef<SignaturePadHandle | null>(null);
    const [options, setOptions] =
        useState<ExampleOptions>(createDefaultOptions);
    const [hasSignature, setHasSignature] = useState(false);
    const [savedDataUrl, setSavedDataUrl] = useState<string | null>(null);
    const [savedBlobInfo, setSavedBlobInfo] = useState("null");
    const [initialDataUrl, setInitialDataUrl] = useState<string | undefined>(
        undefined,
    );
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const [encryptionKeyText, setEncryptionKeyText] = useState<string>("empty");
    const [encryptedPayload, setEncryptedPayload] =
        useState<EncryptedSignaturePayload | null>(null);
    const [encryptionError, setEncryptionError] = useState<string | null>(null);
    const [padSeed, setPadSeed] = useState(0);

    /** 옵션 값을 갱신한다. */
    const updateOption = <Key extends keyof ExampleOptions>(
        key: Key,
        value: ExampleOptions[Key],
    ) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    /** 현재 서명을 저장한다. */
    const handleSave = async () => {
        setSavedDataUrl(signaturePadRef.current?.toDataUrl() ?? null);

        const blob = await signaturePadRef.current?.toBlob();
        setSavedBlobInfo(
            blob
                ? `${blob.type || "application/octet-stream"} / ${blob.size} bytes`
                : "null",
        );
    };

    /** 저장된 서명을 초기값으로 다시 주입한다. */
    const handleRestore = () => {
        setInitialDataUrl(savedDataUrl ?? undefined);
        setPadSeed((prev) => prev + 1);
    };

    /** AES-GCM 예제 키를 생성한다. */
    const handleGenerateEncryptionKey = async () => {
        try {
            const nextKey = await crypto.subtle.generateKey(
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"],
            );
            const rawKey = await crypto.subtle.exportKey("raw", nextKey);

            setEncryptionKey(nextKey);
            setEncryptionKeyText(encodeBase64(rawKey));
            setEncryptionError(null);
        } catch (error) {
            setEncryptionKey(null);
            setEncryptionKeyText("empty");
            setEncryptionError(
                error instanceof Error
                    ? error.message
                    : "암호화 키 생성에 실패했습니다.",
            );
        }
    };

    /** 현재 서명을 암호화 payload로 저장한다. */
    const handleEncrypt = async () => {
        if (!encryptionKey) {
            setEncryptionError("먼저 AES-GCM 키를 생성하세요.");
            return;
        }

        try {
            const payload = await signaturePadRef.current?.exportEncrypted({
                key: encryptionKey,
                aad: encryptionLabelBytes,
            });

            setEncryptedPayload(payload ?? null);
            setEncryptionError(
                payload ? null : "서명이 없어서 암호화할 수 없습니다.",
            );
        } catch (error) {
            setEncryptionError(
                error instanceof Error
                    ? error.message
                    : "서명 암호화에 실패했습니다.",
            );
        }
    };

    /** 저장된 암호문 상태를 비운다. */
    const handleClearEncrypted = () => {
        setEncryptedPayload(null);
        setEncryptionError(null);
    };

    /** 현재 서명을 모두 지운다. */
    const handleClear = () => {
        signaturePadRef.current?.clear();
        setSavedDataUrl(null);
        setSavedBlobInfo("null");
        setInitialDataUrl(undefined);
    };

    /** 옵션을 기본값으로 되돌린다. */
    const handleResetOptions = () => {
        setOptions(createDefaultOptions());
    };

    /** 패드를 완전히 새로 만든다. */
    const handleRemountPad = () => {
        setPadSeed((prev) => prev + 1);
    };

    /** 저장된 URL 미리보기 문자열을 만든다. */
    const dataUrlPreview = useMemo(() => {
        if (!savedDataUrl) {
            return "null";
        }

        return `${savedDataUrl.slice(0, 72)}...`;
    }, [savedDataUrl]);

    return (
        <Stack spacing={2.5}>
            <Card variant="outlined" sx={{ borderRadius: 3.5 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            spacing={2}
                        >
                            <Box>
                                <Typography variant="h5">기본 입력</Typography>
                                <Typography
                                    sx={{ mt: 1, color: "text.secondary" }}
                                >
                                    서명 입력, 저장, 초기화를 한 페이지에서
                                    확인합니다.
                                </Typography>
                            </Box>
                            <ActionToolbar
                                onRestore={handleRestore}
                                onSave={handleSave}
                                onClear={handleClear}
                                onRemount={handleRemountPad}
                            />
                        </Stack>

                        <SignaturePad
                            key={`pad-${padSeed}`}
                            ref={signaturePadRef}
                            minHeight={options.minHeight}
                            lineWidth={options.lineWidth}
                            maxStrokeWidth={options.maxStrokeWidth}
                            enableVariableLineWidth={
                                options.enableVariableLineWidth
                            }
                            minStrokeDistance={options.minStrokeDistance}
                            strokeStyle={options.strokeStyle}
                            backgroundColor={
                                options.transparentBackground
                                    ? undefined
                                    : options.backgroundColor
                            }
                            disabledColor={options.disabledColor}
                            cursor={options.cursor}
                            placeholder={options.placeholder}
                            placeholderStyle={{
                                color: options.placeholderColor,
                                fontSize: options.placeholderFontSize,
                            }}
                            initialDataUrl={initialDataUrl}
                            disabled={options.disabled}
                            readOnly={options.readOnly}
                            onSignatureStateChange={setHasSignature}
                            onChange={setSavedDataUrl}
                        />
                    </Stack>
                </CardContent>
            </Card>

            <OptionsPanel
                options={options}
                onReset={handleResetOptions}
                onOptionChange={updateOption}
            />

            <Card variant="outlined" sx={{ borderRadius: 3.5 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={2}
                        >
                            <Box>
                                <Typography variant="h6">
                                    AES-GCM 암호화 예제
                                </Typography>
                                <Typography
                                    sx={{ mt: 1, color: "text.secondary" }}
                                >
                                    소비처가 키를 만들고, 패키지는 현재 서명을
                                    암호문 payload로 내보냅니다.
                                </Typography>
                            </Box>
                            <Stack
                                direction="row"
                                spacing={1.25}
                                flexWrap="wrap"
                                useFlexGap
                            >
                                <Button
                                    variant="contained"
                                    onClick={handleGenerateEncryptionKey}
                                >
                                    Generate Key
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleEncrypt}
                                >
                                    Encrypt Signature
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleClearEncrypted}
                                >
                                    Clear Payload
                                </Button>
                            </Stack>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Chip
                                color={encryptionKey ? "success" : "default"}
                                label={
                                    encryptionKey
                                        ? "AES-GCM key ready"
                                        : "AES-GCM key empty"
                                }
                            />
                            <Chip
                                color={encryptedPayload ? "success" : "default"}
                                label={
                                    encryptedPayload
                                        ? "encrypted payload ready"
                                        : "encrypted payload empty"
                                }
                            />
                        </Stack>

                        {encryptionError ? (
                            <Alert severity="warning">{encryptionError}</Alert>
                        ) : null}

                        <Box
                            sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "#ffffff",
                                p: 2,
                            }}
                        >
                            <Stack spacing={2}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                >
                                    Generated Key
                                </Typography>
                                <DetailRow
                                    title="FORMAT"
                                    value="AES-256-GCM raw key (base64)"
                                />
                                <DetailRow
                                    title="VALUE"
                                    value={encryptionKeyText}
                                />

                                <Divider />

                                <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                >
                                    Encrypted Payload
                                </Typography>
                                <DetailRow
                                    title="VERSION"
                                    value={
                                        encryptedPayload
                                            ? String(encryptedPayload.version)
                                            : "empty"
                                    }
                                />
                                <DetailRow
                                    title="ALGORITHM"
                                    value={encryptedPayload?.alg ?? "empty"}
                                />
                                <DetailRow
                                    title="MIME TYPE"
                                    value={
                                        encryptedPayload?.mimeType ?? "empty"
                                    }
                                />
                                <DetailRow
                                    title="IV"
                                    value={encryptedPayload?.iv ?? "empty"}
                                />
                                <DetailRow
                                    title="CIPHERTEXT PREVIEW"
                                    value={getCiphertextPreview(
                                        encryptedPayload?.ciphertext,
                                    )}
                                />
                                <DetailRow
                                    title="CIPHERTEXT LENGTH"
                                    value={String(
                                        encryptedPayload?.ciphertext.length ??
                                            0,
                                    )}
                                />
                            </Stack>
                        </Box>

                        <Box
                            sx={{
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "#f8fafc",
                                p: 2,
                            }}
                        >
                            <EncryptedSignatureViewer
                                payload={encryptedPayload}
                                decryptionKey={encryptionKey}
                                aad={encryptionLabelBytes}
                                emptyText="키와 암호문 payload를 준비하면 여기에서 복호화된 서명을 미리 봅니다."
                                errorText="복호화에 실패했습니다. 키 또는 payload를 다시 확인하세요."
                                style={{ minHeight: 120, color: "#475569" }}
                                imageStyle={{
                                    width: "100%",
                                    maxHeight: 220,
                                    objectFit: "contain",
                                    background: "#ffffff",
                                    borderRadius: 16,
                                }}
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <InfoCards
                hasSignature={hasSignature}
                dataUrlPreview={dataUrlPreview}
                blobInfo={savedBlobInfo}
                initialDataLoaded={Boolean(initialDataUrl)}
                encryptionKeyText={encryptionKeyText}
                encryptedPayload={encryptedPayload}
            />
        </Stack>
    );
}
