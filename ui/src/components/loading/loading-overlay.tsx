import * as React from "react"
import LoadingIcon from "./loading-icon"

const LoadingOverlay: React.FC = () => (
    <div className="has-background-white my-0 py-0" style={{ width: "100vw", height: "100vh", position: "absolute", zIndex: 500, top: 0 }}>
        <section className="section">
            <div className="container" style={{ height: "100%" }}>
                <div className="columns" style={{ height: "100%" }}>
                    <div className="column" style={{ height: "100%" }}>
                        <LoadingIcon />
                    </div>
                </div>
            </div>
        </section>
    </div>
)

export default LoadingOverlay