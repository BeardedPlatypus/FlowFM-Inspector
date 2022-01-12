import * as React from "react"
import { PageProps } from "gatsby"
import LoadingOverlay from "../components/loading/loading-overlay"


const LoadingPage: React.FC<PageProps> = () => (
    <div>
        <LoadingOverlay />
        <h1 className="title is-1">
            Test
        </h1>
    </div>
)

export default LoadingPage