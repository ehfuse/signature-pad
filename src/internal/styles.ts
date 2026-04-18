import type { CSSProperties } from "react";

/** 기본 래퍼 스타일을 만든다. */
export function getWrapperStyle(
    minHeight: number,
    backgroundColor?: string,
): CSSProperties {
    return {
        position: "relative",
        minHeight,
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        backgroundColor: backgroundColor ?? "transparent",
        overflow: "hidden",
    };
}

/** 비활성 오버레이 스타일을 만든다. */
export function getDisabledOverlayStyle(disabledColor: string): CSSProperties {
    return {
        position: "absolute",
        inset: 0,
        backgroundColor: disabledColor,
        opacity: 0.45,
        pointerEvents: "none",
        zIndex: 2,
    };
}

/** 기본 캔버스 스타일을 만든다. */
export function getCanvasStyle(
    minHeight: number,
    backgroundColor: string | undefined,
    disabled: boolean,
    readOnly: boolean,
    cursor: CSSProperties["cursor"],
): CSSProperties {
    return {
        width: "100%",
        height: "100%",
        minHeight,
        display: "block",
        backgroundColor: backgroundColor ?? "transparent",
        touchAction: "none",
        cursor: disabled ? "not-allowed" : readOnly ? "default" : cursor,
        imageRendering: "auto",
    };
}

/** 플레이스홀더 스타일을 만든다. */
export function getPlaceholderStyle(
    placeholderStyle?: CSSProperties,
): CSSProperties {
    return {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#94a3b8",
        fontSize: 18,
        fontWeight: 500,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 1,
        ...placeholderStyle,
    };
}
