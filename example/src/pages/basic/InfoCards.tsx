import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import type { EncryptedSignaturePayload } from "@ehfuse/signature-pad";

interface InfoCardsProps {
    hasSignature: boolean;
    dataUrlPreview: string;
    blobInfo: string;
    initialDataLoaded: boolean;
    encryptionKeyText: string;
    encryptedPayload: EncryptedSignaturePayload | null;
}

function InfoCard({ title, value }: { title: string; value: string }) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Typography
                    variant="overline"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    sx={{
                        mt: 1.25,
                        fontSize: 16,
                        fontWeight: 700,
                        wordBreak: "break-all",
                    }}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
}

function DetailRow({ title, value }: { title: string; value: string }) {
    return (
        <Stack spacing={0.5} sx={{ mt: 1.25 }}>
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
                    fontSize: 15,
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

function EncryptionKeyCard({
    encryptionKeyText,
}: {
    encryptionKeyText: string;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Typography
                    variant="overline"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                    }}
                >
                    ENCRYPTION KEY
                </Typography>
                <DetailRow
                    title="FORMAT"
                    value="AES-256-GCM raw key (base64)"
                />
                <DetailRow title="VALUE" value={encryptionKeyText} />
            </CardContent>
        </Card>
    );
}

function EncryptedPayloadCard({
    encryptedPayload,
}: {
    encryptedPayload: EncryptedSignaturePayload | null;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Typography
                    variant="overline"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                    }}
                >
                    ENCRYPTED PAYLOAD
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
                    value={encryptedPayload?.mimeType ?? "empty"}
                />
                <DetailRow title="IV" value={encryptedPayload?.iv ?? "empty"} />
                <DetailRow
                    title="CIPHERTEXT PREVIEW"
                    value={getCiphertextPreview(encryptedPayload?.ciphertext)}
                />
                <DetailRow
                    title="CIPHERTEXT LENGTH"
                    value={String(encryptedPayload?.ciphertext.length ?? 0)}
                />
            </CardContent>
        </Card>
    );
}

/** 예제 상태 요약 카드를 렌더링한다. */
export function InfoCards({
    hasSignature,
    dataUrlPreview,
    blobInfo,
    initialDataLoaded,
    encryptionKeyText,
    encryptedPayload,
}: InfoCardsProps) {
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
                <InfoCard
                    title="HAS SIGNATURE"
                    value={hasSignature ? "true" : "false"}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <InfoCard title="DATA URL" value={dataUrlPreview} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <InfoCard title="BLOB" value={blobInfo} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <InfoCard
                    title="INITIAL DATA URL"
                    value={initialDataLoaded ? "loaded" : "empty"}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <EncryptionKeyCard encryptionKeyText={encryptionKeyText} />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <EncryptedPayloadCard encryptedPayload={encryptedPayload} />
            </Grid>
        </Grid>
    );
}
