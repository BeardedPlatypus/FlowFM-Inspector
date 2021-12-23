import * as React from "react"
import "../styles/global.scss"

import * as styles from "./footer.module.scss"

const Footer = () => (
  <footer className={`footer ${styles.stickyFooter} ${styles.textFooter} has-background-info has-text-white`}>
    <div className="level">
      <div className="level-left">
        <div className="level-item">
          FlowFM Inspector
        </div>
      </div>
      <div className="level-right">
        <div className="level_item">
          Github
        </div>

      </div>
    </div>
  </footer>
)

export default Footer
