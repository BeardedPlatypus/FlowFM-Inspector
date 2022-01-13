import * as React from "react"
import { PageProps } from "gatsby"
import Layout from "../components/layout"
import LoadingOverlay from "../components/loading/loading-overlay"

const IndexPage: React.FC<PageProps> = () => {
    return (
        <div>
            <LoadingOverlay />
            <Layout>
            </Layout>
        </div>
    )
}

export default IndexPage
