import * as React from "react"
import PropTypes from "prop-types"

import "../styles/global.scss"
import Footer from "./footer"

const Layout: React.FC = ({ children }) => {
  return (
    <div>
      <section className="section">
        <div className="container">
          <div className="columns">
            {children}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
