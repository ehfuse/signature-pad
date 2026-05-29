import type { PointerEvent as ReactPointerEvent } from "react";
import type { SignaturePoint } from "../types";

interface SignatureInkBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

const SIGNATURE_INK_ALPHA_THRESHOLD = 16;
const SIGNATURE_INK_LUMINANCE_THRESHOLD = 245;
const SIGNATURE_CROP_PADDING_RATIO = 0.18;
const SIGNATURE_CROP_BLEED_PX = 2;

/** 캔버스에 선 스타일을 적용한다. */
export function applyCanvasStyle(
    context: CanvasRenderingContext2D,
    strokeStyle: string,
    lineWidth: number,
) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
}

/** RGB 픽셀의 상대 밝기를 계산한다. */
function getPixelLuminance(red: number, green: number, blue: number) {
    return red * 0.299 + green * 0.587 + blue * 0.114;
}

/** 캔버스 픽셀 데이터에서 서명 잉크 영역을 찾는다. */
function findSignatureInkBounds(
    imageData: ImageData,
): SignatureInkBounds | null {
    const { width, height, data } = imageData;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const index = (y * width + x) * 4;
            const alpha = data[index + 3] ?? 0;
            if (alpha <= SIGNATURE_INK_ALPHA_THRESHOLD) continue;

            const luminance = getPixelLuminance(
                data[index] ?? 255,
                data[index + 1] ?? 255,
                data[index + 2] ?? 255,
            );
            if (luminance > SIGNATURE_INK_LUMINANCE_THRESHOLD) continue;

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

    return maxX >= minX && maxY >= minY ? { minX, minY, maxX, maxY } : null;
}

/** 캔버스 픽셀을 흰 배경 위에 합성해 복사한다. */
function drawSignaturePixel(
    source: ImageData,
    target: ImageData,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
) {
    if (
        targetX < 0 ||
        targetY < 0 ||
        targetX >= target.width ||
        targetY >= target.height
    )
        return;

    const sourceIndex = (source.width * sourceY + sourceX) * 4;
    const targetIndex = (target.width * targetY + targetX) * 4;
    const alpha = (source.data[sourceIndex + 3] ?? 0) / 255;
    if (alpha <= 0) return;

    target.data[targetIndex] = Math.round(
        (source.data[sourceIndex] ?? 0) * alpha + 255 * (1 - alpha),
    );
    target.data[targetIndex + 1] = Math.round(
        (source.data[sourceIndex + 1] ?? 0) * alpha + 255 * (1 - alpha),
    );
    target.data[targetIndex + 2] = Math.round(
        (source.data[sourceIndex + 2] ?? 0) * alpha + 255 * (1 - alpha),
    );
    target.data[targetIndex + 3] = 255;
}

/** 현재 서명 캔버스를 잉크 bbox 기준 crop 캔버스로 만든다. */
export function createCroppedSignatureCanvas(
    canvas: HTMLCanvasElement,
): HTMLCanvasElement | null {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context || canvas.width <= 0 || canvas.height <= 0) return null;

    const sourceImageData = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
    );
    const bounds = findSignatureInkBounds(sourceImageData);
    if (!bounds) return null;

    const inkWidth = Math.max(1, bounds.maxX - bounds.minX + 1);
    const inkHeight = Math.max(1, bounds.maxY - bounds.minY + 1);
    const padding = Math.max(
        1,
        Math.round(
            Math.max(inkWidth, inkHeight) * SIGNATURE_CROP_PADDING_RATIO,
        ),
    );
    const bleed = Math.min(SIGNATURE_CROP_BLEED_PX, padding);
    const cropMinX = Math.max(0, bounds.minX - bleed);
    const cropMinY = Math.max(0, bounds.minY - bleed);
    const cropMaxX = Math.min(canvas.width - 1, bounds.maxX + bleed);
    const cropMaxY = Math.min(canvas.height - 1, bounds.maxY + bleed);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = inkWidth + padding * 2;
    outputCanvas.height = inkHeight + padding * 2;
    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) return null;

    const outputImageData = outputContext.createImageData(
        outputCanvas.width,
        outputCanvas.height,
    );
    for (let index = 0; index < outputImageData.data.length; index += 4) {
        outputImageData.data[index] = 255;
        outputImageData.data[index + 1] = 255;
        outputImageData.data[index + 2] = 255;
        outputImageData.data[index + 3] = 255;
    }

    for (let sourceY = cropMinY; sourceY <= cropMaxY; sourceY += 1) {
        for (let sourceX = cropMinX; sourceX <= cropMaxX; sourceX += 1) {
            drawSignaturePixel(
                sourceImageData,
                outputImageData,
                sourceX,
                sourceY,
                padding - (bounds.minX - cropMinX) + (sourceX - cropMinX),
                padding - (bounds.minY - cropMinY) + (sourceY - cropMinY),
            );
        }
    }

    outputContext.putImageData(outputImageData, 0, 0);
    return outputCanvas;
}

/** 현재 서명 캔버스를 crop된 data URL로 내보낸다. */
export function exportCroppedSignatureDataUrl(
    canvas: HTMLCanvasElement,
    type = "image/png",
    quality?: number,
) {
    return (
        createCroppedSignatureCanvas(canvas)?.toDataURL(type, quality) ??
        canvas.toDataURL(type, quality)
    );
}

/** 현재 서명 캔버스를 crop된 Blob으로 내보낸다. */
export function exportCroppedSignatureBlob(
    canvas: HTMLCanvasElement,
    type = "image/png",
    quality?: number,
) {
    const exportCanvas = createCroppedSignatureCanvas(canvas) ?? canvas;
    return new Promise<Blob | null>((resolve) => {
        exportCanvas.toBlob((blob) => resolve(blob), type, quality);
    });
}

/** 현재 선 굵기를 반영한다. */
export function applyStrokeWidth(
    context: CanvasRenderingContext2D,
    lineWidth: number,
) {
    context.lineWidth = lineWidth;
}

/** 두 점 사이 선분을 부드럽게 그린다. */
export function drawSmoothSegment(
    context: CanvasRenderingContext2D,
    movePoint: SignaturePoint,
    controlPoint: SignaturePoint,
    endPoint: SignaturePoint,
    lineWidth: number,
) {
    applyStrokeWidth(context, lineWidth);
    context.beginPath();
    context.moveTo(movePoint.x, movePoint.y);
    context.quadraticCurveTo(
        controlPoint.x,
        controlPoint.y,
        endPoint.x,
        endPoint.y,
    );
    context.stroke();
}

/** 이동 속도에 따라 선 굵기를 계산한다. */
export function getVariableStrokeWidth(
    minStrokeWidth: number,
    maxStrokeWidth: number,
    distance: number,
    deltaTime: number,
    previousStrokeWidth: number,
) {
    const speed = distance / Math.max(deltaTime, 1);
    const normalizedSpeed = Math.min(speed / 1.5, 1);
    const targetStrokeWidth =
        maxStrokeWidth - normalizedSpeed * (maxStrokeWidth - minStrokeWidth);

    return (
        previousStrokeWidth + (targetStrokeWidth - previousStrokeWidth) * 0.35
    );
}

/** 두 점 사이 거리를 계산한다. */
export function getPointDistance(
    startPoint: SignaturePoint,
    endPoint: SignaturePoint,
) {
    return Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
}

/** 두 점의 중간점을 구한다. */
export function getMidPoint(
    startPoint: SignaturePoint,
    endPoint: SignaturePoint,
): SignaturePoint {
    return {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2,
    };
}

/** 짧게 찍는 입력도 점으로 마감한다. */
export function drawTapDot(
    context: CanvasRenderingContext2D,
    point: SignaturePoint,
    lineWidth: number,
    strokeStyle: string,
) {
    context.save();
    context.fillStyle = strokeStyle;
    context.beginPath();
    context.arc(point.x, point.y, Math.max(lineWidth / 2, 1), 0, Math.PI * 2);
    context.fill();
    context.restore();
}

/** 캔버스 실제 크기를 초기화한다. */
export function initializeCanvas(
    canvas: HTMLCanvasElement,
    strokeStyle: string,
    lineWidth: number,
    backgroundColor?: string,
) {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;

    if (width === 0 || height === 0) {
        return false;
    }

    canvas.width = Math.round(width * devicePixelRatio);
    canvas.height = Math.round(height * devicePixelRatio);

    const context = canvas.getContext("2d");
    if (!context) {
        return false;
    }

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    if (backgroundColor && backgroundColor !== "transparent") {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
    }
    applyCanvasStyle(context, strokeStyle, lineWidth);
    return true;
}

/** 캔버스 픽셀 비율이 현재 레이아웃과 맞는지 확인한다. */
export function isCanvasResolutionSynced(canvas: HTMLCanvasElement) {
    const devicePixelRatio = window.devicePixelRatio || 1;
    return (
        canvas.width === Math.round(canvas.offsetWidth * devicePixelRatio) &&
        canvas.height === Math.round(canvas.offsetHeight * devicePixelRatio)
    );
}

/** 포인터 이벤트에서 캔버스 좌표를 구한다. */
export function getCanvasPoint(
    canvas: HTMLCanvasElement,
    event: ReactPointerEvent<HTMLCanvasElement>,
): SignaturePoint {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}

/** 데이터 URL 서명을 캔버스에 복원한다. */
export function restoreCanvasSignature(
    canvas: HTMLCanvasElement,
    dataUrl: string,
    strokeStyle: string,
    lineWidth: number,
    backgroundColor: string | undefined,
    onComplete: (restored: boolean) => void,
) {
    const image = new Image();
    image.onload = () => {
        const initialized = initializeCanvas(
            canvas,
            strokeStyle,
            lineWidth,
            backgroundColor,
        );
        if (!initialized) {
            onComplete(false);
            return;
        }

        const context = canvas.getContext("2d");
        if (!context) {
            onComplete(false);
            return;
        }

        context.drawImage(image, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        applyCanvasStyle(context, strokeStyle, lineWidth);
        onComplete(true);
    };
    image.onerror = () => onComplete(false);
    image.src = dataUrl;
}
