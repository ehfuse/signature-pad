import type { PointerEvent as ReactPointerEvent } from "react";
import type { SignaturePoint } from "../types";

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
