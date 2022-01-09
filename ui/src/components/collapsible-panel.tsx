import * as React from "react"
import { useSpring, animated } from "react-spring"
import useResizeAware from 'react-resize-aware';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

export interface CollapsiblePanelProps {
    header: string
    children: React.ReactChild | React.ReactChildren
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ header, children }: CollapsiblePanelProps) => {
    const [isCollapsed, setCollapsed] = React.useState(true)

    const [resizeListener, sizes] = useResizeAware();
    let restoreHeight = sizes.height

    const { rotate, opacity, height } = useSpring({
        to: { rotate: 0, opacity: 1, height: restoreHeight },
        from: { rotate: -90, opacity: 0, height: 0 },
        reverse: isCollapsed,
    })

    const handleClick = () => {
        if (!isCollapsed) {
            restoreHeight = sizes.height;
        }

        setCollapsed(!isCollapsed)
    }

    return (
        <div className="pt-3">
            <div className="box p-0" >
                <button className="button is-white is-fullwidth has-text-left level m-0 is-medium" onClick={handleClick}>
                    <div className="level-left m-2 p-2">
                        <div className="level-item pr-1">
                            <animated.div style={{ rotate }}>
                                <FontAwesomeIcon icon={faCaretDown} />
                            </animated.div>
                        </div>

                        <div className="level-item">
                            <h2 className="subtitle is-4">{header}</h2>
                        </div>
                    </div>
                </button>

                <animated.div style={{ overflow: 'hidden', opacity, height }}>
                    <div style={{ position: 'relative' }}>
                        {resizeListener}
                        {children}
                    </div>
                </animated.div>
            </div >
        </div >
    )
}
