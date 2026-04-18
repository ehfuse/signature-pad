import {
    forwardRef,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import type { ForwardedRef, PointerEvent as ReactPointerEvent } from "react";
import type {
    SignaturePadHandle,
    SignatureEncryptionOptions,
    SignaturePadProps,
    SignaturePoint,
} from "./types";
import { encryptSignatureBlob } from "./internal/crypto";
import {
    drawSmoothSegment,
    drawTapDot,
    getCanvasPoint,
    getMidPoint,
    getPointDistance,
    getVariableStrokeWidth,
    initializeCanvas,
    isCanvasResolutionSynced,
    restoreCanvasSignature,
} from "./internal/canvas";
import {
    getCanvasStyle,
    getDisabledOverlayStyle,
    getPlaceholderStyle,
    getWrapperStyle,
} from "./internal/styles";

/** 공용 서명 패드 렌더 함수를 만든다. */
function SignaturePadInner(
    {
        minHeight = 240,
        placeholder = "서명하세요",
        placeholderStyle,
        cursor = "pointer",
        lineWidth = 3,
        maxStrokeWidth,
        enableVariableLineWidth = true,
        minStrokeDistance,
        strokeStyle = "#0f172a",
        backgroundColor,
        disabledColor = "#cbd5e1",
        initialDataUrl,
        className,
        style,
        canvasStyle,
        disabled = false,
        readOnly = false,
        onSignatureStateChange,
        onChange,
    }: SignaturePadProps,
    ref: ForwardedRef<SignaturePadHandle>,
) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const lastPointRef = useRef<SignaturePoint | null>(null);
    const lastMidPointRef = useRef<SignaturePoint | null>(null);
    const lastEventTimeRef = useRef<number | null>(null);
    const currentStrokeWidthRef = useRef(lineWidth);
    const strokeMovedRef = useRef(false);
    const hasSignatureRef = useRef(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const effectiveMaxStrokeWidth = Math.max(
        maxStrokeWidth ?? Math.max(lineWidth * 1.5, lineWidth),
        lineWidth,
    );
    const effectiveMinStrokeDistance =
        minStrokeDistance ?? Math.max(1.5, lineWidth * 0.4);
    const isInteractionBlocked = disabled || readOnly;

    /** 서명 상태를 동기화한다. */
    const updateSignatureState = (nextHasSignature: boolean) => {
        hasSignatureRef.current = nextHasSignature;
        setHasSignature(nextHasSignature);
        onSignatureStateChange?.(nextHasSignature);
    };

    /** 현재 이미지를 변경 핸들러로 전달한다. */
    const emitChange = () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignatureRef.current) {
            onChange?.(null);
            return;
        }

        onChange?.(canvas.toDataURL("image/png"));
    };

    /** 캔버스를 초기 상태로 되돌린다. */
    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const initialized = initializeCanvas(
            canvas,
            strokeStyle,
            lineWidth,
            backgroundColor,
        );
        if (!initialized) {
            return;
        }

        setIsDrawing(false);
        lastPointRef.current = null;
        lastMidPointRef.current = null;
        lastEventTimeRef.current = null;
        currentStrokeWidthRef.current = lineWidth;
        strokeMovedRef.current = false;
        updateSignatureState(false);
        onChange?.(null);
    };

    /** 현재 서명을 Blob으로 직렬화한다. */
    const exportCurrentBlob = (type = "image/png", quality?: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignatureRef.current) {
            return Promise.resolve<Blob | null>(null);
        }

        return new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), type, quality);
        });
    };

    useImperativeHandle(
        ref,
        () => ({
            clear: resetCanvas,
            hasSignature: () => hasSignatureRef.current,
            toDataUrl: (type = "image/png", quality) => {
                const canvas = canvasRef.current;
                if (!canvas || !hasSignatureRef.current) {
                    return null;
                }

                return canvas.toDataURL(type, quality);
            },
            toBlob: (type = "image/png", quality) => {
                return exportCurrentBlob(type, quality);
            },
            exportEncrypted: async ({
                key,
                aad,
                type = "image/png",
                quality,
            }: SignatureEncryptionOptions) => {
                const blob = await exportCurrentBlob(type, quality);
                if (!blob) {
                    return null;
                }

                return encryptSignatureBlob(blob, {
                    key,
                    aad,
                    type,
                    quality,
                });
            },
        }),
        [backgroundColor, lineWidth, strokeStyle],
    );

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        let frameId: number | null = null;

        /** 현재 캔버스 상태를 즉시 동기화한다. */
        const syncCanvas = () => {
            if (!canvasRef.current) {
                return;
            }

            if (
                canvasRef.current.offsetWidth === 0 ||
                canvasRef.current.offsetHeight === 0
            ) {
                frameId = window.requestAnimationFrame(syncCanvas);
                return;
            }

            if (initialDataUrl) {
                restoreCanvasSignature(
                    canvasRef.current,
                    initialDataUrl,
                    strokeStyle,
                    lineWidth,
                    backgroundColor,
                    (restored) => {
                        updateSignatureState(restored);
                        onChange?.(restored ? initialDataUrl : null);
                    },
                );
                return;
            }

            const initialized = initializeCanvas(
                canvasRef.current,
                strokeStyle,
                lineWidth,
                backgroundColor,
            );
            if (!initialized) {
                return;
            }

            updateSignatureState(false);
            currentStrokeWidthRef.current = lineWidth;
        };

        syncCanvas();

        if (typeof ResizeObserver !== "undefined") {
            resizeObserverRef.current = new ResizeObserver(() => {
                if (!canvasRef.current || hasSignatureRef.current) {
                    return;
                }

                initializeCanvas(
                    canvasRef.current,
                    strokeStyle,
                    lineWidth,
                    backgroundColor,
                );
            });
            resizeObserverRef.current.observe(canvas);
        }

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }

            resizeObserverRef.current?.disconnect();
            resizeObserverRef.current = null;
        };
    }, [backgroundColor, initialDataUrl, lineWidth, onChange, strokeStyle]);

    /** 서명 시작을 처리한다. */
    const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (isInteractionBlocked) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        if (!isCanvasResolutionSynced(canvas)) {
            const initialized = initializeCanvas(
                canvas,
                strokeStyle,
                lineWidth,
                backgroundColor,
            );
            if (!initialized) {
                return;
            }
        }

        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        const point = getCanvasPoint(canvas, event);
        setIsDrawing(true);
        lastPointRef.current = point;
        lastMidPointRef.current = point;
        lastEventTimeRef.current = event.timeStamp;
        currentStrokeWidthRef.current = enableVariableLineWidth
            ? effectiveMaxStrokeWidth
            : lineWidth;
        strokeMovedRef.current = false;
        updateSignatureState(true);
        canvas.setPointerCapture(event.pointerId);
    };

    /** 서명 이동을 처리한다. */
    const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || isInteractionBlocked) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas || !lastPointRef.current) {
            return;
        }

        const context = canvas.getContext("2d");
        if (!context) {
            return;
        }

        const point = getCanvasPoint(canvas, event);
        const distance = getPointDistance(lastPointRef.current, point);
        if (distance < effectiveMinStrokeDistance) {
            return;
        }

        const deltaTime =
            event.timeStamp - (lastEventTimeRef.current ?? event.timeStamp);
        const nextStrokeWidth = enableVariableLineWidth
            ? getVariableStrokeWidth(
                  lineWidth,
                  effectiveMaxStrokeWidth,
                  distance,
                  deltaTime,
                  currentStrokeWidthRef.current,
              )
            : lineWidth;

        const nextMidPoint = getMidPoint(lastPointRef.current, point);
        drawSmoothSegment(
            context,
            lastMidPointRef.current ?? lastPointRef.current,
            lastPointRef.current,
            nextMidPoint,
            enableVariableLineWidth
                ? (currentStrokeWidthRef.current + nextStrokeWidth) / 2
                : lineWidth,
        );
        strokeMovedRef.current = true;
        lastPointRef.current = point;
        lastMidPointRef.current = nextMidPoint;
        lastEventTimeRef.current = event.timeStamp;
        currentStrokeWidthRef.current = nextStrokeWidth;
    };

    /** 서명 종료를 처리한다. */
    const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const context = canvas.getContext("2d");
        if (context && lastPointRef.current && !strokeMovedRef.current) {
            const endPoint = getCanvasPoint(canvas, event);
            drawTapDot(
                context,
                endPoint,
                enableVariableLineWidth
                    ? currentStrokeWidthRef.current
                    : lineWidth,
                strokeStyle,
            );
        }

        setIsDrawing(false);
        lastPointRef.current = null;
        lastMidPointRef.current = null;
        lastEventTimeRef.current = null;
        currentStrokeWidthRef.current = lineWidth;
        strokeMovedRef.current = false;
        emitChange();

        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }
    };

    /** 포인터 이탈 시 드로잉 상태를 정리한다. */
    const handlePointerLeave = () => {
        setIsDrawing(false);
        lastPointRef.current = null;
        lastMidPointRef.current = null;
        lastEventTimeRef.current = null;
        currentStrokeWidthRef.current = lineWidth;
        strokeMovedRef.current = false;
    };

    return (
        <div
            className={className}
            style={{
                ...getWrapperStyle(minHeight, backgroundColor),
                ...style,
            }}
        >
            {!hasSignature ? (
                <div style={getPlaceholderStyle(placeholderStyle)}>
                    {placeholder}
                </div>
            ) : null}
            <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                style={{
                    ...getCanvasStyle(
                        minHeight,
                        backgroundColor,
                        disabled,
                        readOnly,
                        cursor,
                    ),
                    ...canvasStyle,
                }}
            />
            {disabled ? (
                <div style={getDisabledOverlayStyle(disabledColor)} />
            ) : null}
        </div>
    );
}

/** 공용 서명 패드를 렌더링한다. */
export const SignaturePad = forwardRef(SignaturePadInner);
