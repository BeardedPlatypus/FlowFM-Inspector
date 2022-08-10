import * as React from "react"
import { PageProps } from "gatsby"
import Layout from "../components/layout"
import LoadingOverlay from "../components/loading/loading-overlay"
import { useSpring, useTransition, animated, config } from "react-spring"

function Mount() {
    const [show, set] = React.useState(false)
    const transitions = useTransition(show, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        reverse: show,
        delay: 200,
        config: config.molasses,
        onRest: () => set(!show),
    })
    return transitions(
        (styles, item) => item && <animated.div style={styles}>✌️</animated.div>
    )
}


const UnmountPage: React.FC<PageProps> = () => {
    return (
        <div>
            <Layout>
                <Mount></Mount>
            </Layout>
        </div>
    )
}

export default UnmountPage
