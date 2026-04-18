import { Button, Stack } from "@mui/material";

interface ActionToolbarProps {
    onRestore: () => void;
    onSave: () => void;
    onClear: () => void;
    onRemount: () => void;
}

/** 예제 상단 액션 버튼을 렌더링한다. */
export function ActionToolbar({
    onRestore,
    onSave,
    onClear,
    onRemount,
}: ActionToolbarProps) {
    return (
        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Button variant="contained" onClick={onRestore}>
                Restore Saved
            </Button>
            <Button variant="contained" onClick={onSave}>
                Save
            </Button>
            <Button variant="outlined" onClick={onClear}>
                Clear
            </Button>
            <Button variant="outlined" onClick={onRemount}>
                Remount
            </Button>
        </Stack>
    );
}
