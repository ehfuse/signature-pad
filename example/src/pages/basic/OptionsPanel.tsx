import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { ChangeEvent } from "react";
import type { ExampleOptions, CursorOption } from "./types";

interface OptionsPanelProps {
    options: ExampleOptions;
    onReset: () => void;
    onOptionChange: <Key extends keyof ExampleOptions>(
        key: Key,
        value: ExampleOptions[Key],
    ) => void;
}

const cursorOptions: CursorOption[] = [
    "pointer",
    "crosshair",
    "default",
    "grab",
];

/** 숫자 입력값을 안전하게 읽는다. */
function getNumberValue(
    event: ChangeEvent<HTMLInputElement>,
    fallback: number,
) {
    return Number(event.target.value) || fallback;
}

/** 예제 옵션 패널을 렌더링한다. */
export function OptionsPanel({
    options,
    onReset,
    onOptionChange,
}: OptionsPanelProps) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography
                            variant="overline"
                            sx={{
                                color: "text.secondary",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                            }}
                        >
                            OPTIONS
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            패드 옵션 설정
                        </Typography>
                    </Box>
                    <Box>
                        <Button variant="outlined" onClick={onReset}>
                            Reset Options
                        </Button>
                    </Box>
                </Stack>

                <Grid container spacing={1.75}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            label="Placeholder"
                            value={options.placeholder}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "placeholder",
                                    event.target.value,
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            select
                            fullWidth
                            label="Cursor"
                            value={options.cursor}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "cursor",
                                    event.target.value as CursorOption,
                                )
                            }
                        >
                            {cursorOptions.map((cursorOption) => (
                                <MenuItem
                                    key={cursorOption}
                                    value={cursorOption}
                                >
                                    {cursorOption}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Line Width (px)"
                            value={options.lineWidth}
                            slotProps={{
                                htmlInput: { min: 1, max: 30, step: 1 },
                            }}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "lineWidth",
                                    getNumberValue(event, 1),
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Max Stroke Width (px)"
                            value={options.maxStrokeWidth}
                            slotProps={{
                                htmlInput: { min: 1, max: 40, step: 1 },
                            }}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "maxStrokeWidth",
                                    getNumberValue(event, 1),
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Min Height"
                            value={options.minHeight}
                            slotProps={{
                                htmlInput: { min: 120, max: 600, step: 10 },
                            }}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "minHeight",
                                    getNumberValue(event, 120),
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Min Stroke Distance"
                            value={options.minStrokeDistance}
                            slotProps={{
                                htmlInput: { min: 0, max: 20, step: 0.5 },
                            }}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "minStrokeDistance",
                                    getNumberValue(event, 0),
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="color"
                            label="Stroke Color"
                            value={options.strokeStyle}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "strokeStyle",
                                    event.target.value,
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={options.transparentBackground}
                                    onChange={(
                                        event: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        onOptionChange(
                                            "transparentBackground",
                                            event.target.checked,
                                        )
                                    }
                                />
                            }
                            label="transparentBackground"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="color"
                            label="Background Color"
                            value={options.backgroundColor}
                            disabled={options.transparentBackground}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "backgroundColor",
                                    event.target.value,
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="color"
                            label="Disabled Color"
                            value={options.disabledColor}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "disabledColor",
                                    event.target.value,
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="color"
                            label="Placeholder Color"
                            value={options.placeholderColor}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "placeholderColor",
                                    event.target.value,
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Placeholder Font Size (px)"
                            value={options.placeholderFontSize}
                            slotProps={{
                                htmlInput: { min: 10, max: 40, step: 1 },
                            }}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                onOptionChange(
                                    "placeholderFontSize",
                                    getNumberValue(event, 10),
                                )
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={options.disabled}
                                    onChange={(
                                        event: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        onOptionChange(
                                            "disabled",
                                            event.target.checked,
                                        )
                                    }
                                />
                            }
                            label="disabled"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={options.readOnly}
                                    onChange={(
                                        event: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        onOptionChange(
                                            "readOnly",
                                            event.target.checked,
                                        )
                                    }
                                />
                            }
                            label="readOnly"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={options.enableVariableLineWidth}
                                    onChange={(
                                        event: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        onOptionChange(
                                            "enableVariableLineWidth",
                                            event.target.checked,
                                        )
                                    }
                                />
                            }
                            label="enableVariableLineWidth"
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
