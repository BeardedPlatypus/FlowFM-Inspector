import * as React from "react"
import LoadingIcon from "./loading-icon"
import { useSpring, useTransition, animated, config } from "react-spring"


export interface LoadingOverlayProps {
    fadeIn?: boolean
    show?: boolean
    delay?: number
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = (props: LoadingOverlayProps) => {
    const initialDelay = 100
    const fadeIn = props.fadeIn != null ? props.fadeIn : false
    const delay = initialDelay + (props.delay != null ? props.delay : 0)
    const delayIcon = delay + (props.fadeIn != null ? 300 : 0)

    const [show, setShow] = React.useState(props.show != null ? props.show : false)
    React.useEffect(() => {
        setShow(props.show != null ? props.show : false)
    }, [props.show])

    const transitions = useTransition(show, {
        unique: true,
        from: { opacity: fadeIn ? 0 : 1 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        delay: delay,
    })

    return (
        transitions(({ opacity }, item) =>
            item &&
            <animated.div className="has-background-white my-0 py-0"
                style={{
                    opacity: opacity,
                    width: "100vw",
                    height: "100vh",
                    position: "absolute",
                    zIndex: 500,
                    top: 0
                }}>
                <section className="section">
                    <div className="container" style={{ height: "100%" }}>
                        <div className="columns" style={{ height: "100%" }}>
                            <div className="column" style={{ height: "100%" }}>
                                <LoadingIcon delay={delayIcon} />
                            </div>
                        </div>
                    </div>
                </section>
            </animated.div>
        )
    )
}

export default LoadingOverlay