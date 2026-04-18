export type CursorOption = "pointer" | "crosshair" | "default" | "grab";

export interface ExampleOptions {
    minHeight: number;
    lineWidth: number;
    maxStrokeWidth: number;
    enableVariableLineWidth: boolean;
    minStrokeDistance: number;
    strokeStyle: string;
    transparentBackground: boolean;
    backgroundColor: string;
    disabledColor: string;
    placeholderColor: string;
    placeholderFontSize: number;
    cursor: CursorOption;
    placeholder: string;
    disabled: boolean;
    readOnly: boolean;
}

/** 예제 기본 옵션을 만든다. */
export function createDefaultOptions(): ExampleOptions {
    return {
        minHeight: 280,
        lineWidth: 10,
        maxStrokeWidth: 14,
        enableVariableLineWidth: true,
        minStrokeDistance: 4,
        strokeStyle: "#0f172a",
        transparentBackground: true,
        backgroundColor: "#ffffff",
        disabledColor: "#cbd5e1",
        placeholderColor: "#94a3b8",
        placeholderFontSize: 18,
        cursor: "pointer",
        placeholder: "서명하세요",
        disabled: false,
        readOnly: false,
    };
}
