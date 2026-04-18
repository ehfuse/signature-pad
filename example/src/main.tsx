import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// 예제 앱을 마운트한다.
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
