import * as React from "react"
import { PageProps } from "gatsby"
import Footer from "../components/footer"


const Icon: React.FC = () => {
    const iconPointsOutline = "m 98.273806,250.41425 c 0,0 -62.924596,1.3868 -66.523809,-58.39732 C 30.349999,136.2618 92.232462,75.218518 98.273806,74.65532 c 6.041344,0.563198 67.923804,61.60648 66.523814,117.36161 -3.59922,59.78412 -66.523814,58.39732 -66.523814,58.39732 z"
    const iconPointsOuter = "m 262.85742,11.388672 c 0.45043,0.04199 0.99433,0.187128 1.60938,0.416016 -0.60603,-0.215336 -1.16201,-0.37431 -1.60938,-0.416016 z m 0,0 C 240.024,13.517294 6.1364034,244.23093 11.427734,454.95898 25.031059,680.91471 262.85742,675.67383 262.85742,675.67383 c 0,0 210.52818,4.62967 246.75196,-183.02539 C 406.15362,713.14915 62.621129,647.27976 47.876953,454.51172 32.633068,255.21039 197.06533,78.986475 262.85742,11.388672 Z m 2.09766,0.607422 C 290.33432,22.684567 434.749,170.65868 494.00391,332.95312 439.15355,169.10777 290.75701,22.35527 264.95508,11.996094 Z"
    const iconPointsInner = "M 41.393952,191.89833 C 37.360674,139.16652 80.866316,92.540572 98.273806,74.65532 c 6.041344,0.563198 69.246714,65.38623 67.846724,121.14136 -23.66994,65.67837 -120.6933,48.83346 -124.726578,-3.89835 z"
    const iconEyes = "m 70.870138,158.56101 v 7.9375 m 54.807342,-7.9375 v 7.9375"
    const iconMouth = "m 90.052808,167.29562 c 2.16026,3.04052 8.221,2.94113 8.221,2.94113 0,0 6.060752,0.0994 8.221002,-2.94113"

    return (
        <svg style={{ height: "100px" }} viewBox="0 0 139.09511 181.77489">
            <g transform="translate(-28.726254,-71.642315)">
                <path d={iconPointsOuter}
                    transform="matrix(0.26458333,0,0,0.26458333,28.726254,71.642315)"
                    fill="#75b8dbff"
                    stroke="transparent"
                />

                <path d={iconPointsInner}
                    fill="#96ccec"
                />

                <path d={iconPointsOutline}
                    strokeWidth="5"
                    fill="transparent"
                    stroke="rgb(45, 55, 71)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <g>
                    <path d={iconEyes}
                        strokeWidth="5"
                        fill="transparent"
                        stroke="rgb(45, 55, 71)"
                        strokeLinecap="round"
                        strokeLinejoin="round" />

                    <path d={iconMouth}
                        strokeWidth="5"
                        fill="transparent"
                        stroke="rgb(45, 55, 71)"
                        strokeLinecap="round"
                        strokeLinejoin="round" />
                </g>
            </g>
        </svg>
    )

}


const StartUp: React.FC<PageProps> = () => {
    return (
        <div>
            <section className="section">
                <div className="container">

                    <div className="box">
                        <div className="columns is-variable is-4 is-flex is-vcentered">
                            <div className="column is-narrow">
                                <Icon />
                            </div>
                            <div className="column">
                                <h1 className="title is-1">FlowFM Inspector</h1>
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column is-two-thirds">
                            <div className="box">
                                <h1 className="title is-3">Open recent</h1>
                            </div>
                        </div>
                        <div className="column">
                            <div className="box">
                                <h1 className="title is-3">Get started</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default StartUp
