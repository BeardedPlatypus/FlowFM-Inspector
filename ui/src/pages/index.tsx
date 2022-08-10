import * as React from "react"
import { PageProps } from "gatsby"
import Layout from "../components/layout"
import LoadingOverlay from "../components/loading/loading-overlay"

const IndexPage: React.FC<PageProps> = () => {
    const [showOverlay, setShowOverlay] = React.useState(false)

    function reShow() {
        setShowOverlay(false)
        setTimeout(ShowTemporarily, 3000)
    }

    function ShowTemporarily() {
        setShowOverlay(true)
        setTimeout(reShow, 3000)
    }

    React.useEffect(() => {
        setTimeout(ShowTemporarily, 2000)
    }, [])

    return (
        <div>
            <LoadingOverlay fadeIn show={showOverlay} />
            <Layout>
                <div></div>
            </Layout>
        </div>
    )
}

export default IndexPage
