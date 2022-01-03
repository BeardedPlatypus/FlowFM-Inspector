import { PageProps } from "gatsby"
import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"

const NotFoundPage: React.FC<PageProps> = () => (
  <Layout>
    <Seo title="404: Not found" />
    <div className="column">
      <h1 className="title">404: Not Found</h1>
    </div>
  </Layout>
)

export default NotFoundPage
