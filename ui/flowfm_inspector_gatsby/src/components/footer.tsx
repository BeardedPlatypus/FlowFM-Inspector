import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithubAlt, IconDefinition } from "@fortawesome/free-brands-svg-icons";

import "../styles/global.scss"
import * as styles from "./footer.module.scss"

interface SocialButtonProps {
  link: string
  icon: IconDefinition
}

const SocialButton: React.FC<SocialButtonProps> = (props: SocialButtonProps) => {
  return (
    <a href={props.link} target="_blank" rel="noreferrer">
      <span className="fa-layers fa-fw fa-2x has-text-white">
        <FontAwesomeIcon icon={props.icon} transform="shrink-5" />
      </span>
    </a>
  )
}

const Footer: React.FC = () => (
  <footer className={`footer ${styles.stickyFooter} ${styles.textFooter} has-background-info has-text-white`}>
    <div className="level">
      <div className="level-left">
        <div className="level-item">
          FlowFM Inspector
        </div>
      </div>
      <div className="level-right">
        <div className="level_item">
          <SocialButton link="https://github.com/BeardedPlatypus/FlowFM-Inspector" icon={faGithubAlt} />
        </div>

      </div>
    </div>
  </footer>
)

export default Footer
