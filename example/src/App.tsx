import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { BasicPage } from "./pages/BasicPage";

/** 예제 레이아웃을 렌더링한다. */
function ExampleLayout() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
                color: "#0f172a",
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    padding: "40px 20px 80px",
                }}
            >
                <header style={{ marginBottom: 28 }}>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: "0.12em",
                            color: "#475569",
                        }}
                    >
                        @ehfuse/signature-pad
                    </div>
                    <h1
                        style={{
                            margin: "10px 0 0",
                            fontSize: 36,
                            lineHeight: 1.1,
                        }}
                    >
                        Signature Pad Example
                    </h1>
                    <p
                        style={{
                            margin: "12px 0 0",
                            fontSize: 16,
                            color: "#334155",
                        }}
                    >
                        패키지 소스를 alias로 직접 연결한 Vite 예제 앱입니다.
                    </p>
                </header>

                <Outlet />
            </div>
        </div>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <ExampleLayout />,
        children: [
            {
                index: true,
                element: <BasicPage />,
            },
        ],
    },
]);

/** 예제 앱 라우터를 렌더링한다. */
export function App() {
    return <RouterProvider router={router} />;
}
