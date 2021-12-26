import * as React from "react"
import { useSpring, animated } from "react-spring"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

import Layout from "../components/layout"
import "../styles/global.scss"
import * as styles from "./index.module.scss"


function InputNumberElement(data) {
  // TODO: add a separate integer.
  return (
    <div className="control is-expanded is-fullwidth">
      <input className="input has-text-right" value={data.value} type="number" />
    </div>
  )
}


function InputEnumElement(data) {
  // TODO: add name
  return (
    <div className="control is-expanded is-fullwidth">
      <div className="select is-fullwidth">
        <select className="is-fullwidth has-text-right">
          {data.enumValues.map(v => {
            return (
              <option key={String(v)} value={v} selected={v === data.value}>{v}</option>
            )
          })}
        </select>
      </div>
    </div>
  )
}

function InputBooleanElement(data) {
  // TODO: add name
  return (
    <div className="control is-expanded is-fullwidth">
      <div className="select is-fullwidth">
        <select className="is-fullwidth has-text-right">
          <option value={true} selected={data.value}>True</option>
          <option value={false} selected={!data.value}>False</option>
        </select>
      </div>
    </div>
  )
}

function InputStringElement(data) {
  return (
    <div className="control is-expanded is-fullwidth">
      <input className="input has-text-right" value={data.value} type="text" />
    </div>
  )
}

function InputElement(data) {
  switch (data.valueType) {
    case "number":
    case "integer":
      return InputNumberElement(data)
    case "boolean":
      return InputBooleanElement(data)
    case "enum":
      return InputEnumElement(data)
    case "string":
    default:
      return InputStringElement(data)
  }
}

function TableRow(props) {
  return (
    <tr key={`Table_${props.table}_${props.key}`}>
      <td className={styles.keyColumn}>{props.key}</td>
      <td className={styles.valueColumn}>{InputElement(props)}</td>
      <td className={styles.commentColumn}><input className="input" value={(props.comment === undefined) ? "" : props.comment} /></td>
    </tr>
  )
}

function RetrieveHeader(data) {
  return data.title;
}

function MapToRow(table, [key, value]) {
  const is_enum = "enum" in value

  return {
    table: table,
    key: key,
    value: value.default,
    valueType: is_enum ? "enum" : value.type,
    enumValues: value.enum,
  }
}

function RetrieveRows(data) {
  return Object.entries(data.properties).map(v => MapToRow(data.title, v));
}

function Table(props) {
  const [tableHeader, setTableHeader] = React.useState("")
  const [tableRows, setTableRows] = React.useState([])
  const [isCollapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    console.log(props.schema_location)

    fetch(props.schema_location)
      .then(response => response.json())
      .then(data => {
        setTableHeader(RetrieveHeader(data));
        setTableRows(RetrieveRows(data))
      })

  }, []);

  const { rotate } = useSpring({
    to: { rotate: 0 },
    from: { rotate: -90 },
    reverse: isCollapsed,
  })

  return (
    <div key={`Table_${tableHeader}`} className="pt-6">
      <div className="level" onClick={() => setCollapsed(!isCollapsed)}>
        <div className="level-left">
          <div className="level-item">
            <animated.div style={{ rotate }} on={isCollapsed}>
              <FontAwesomeIcon icon={faCaretDown} />
            </animated.div>
          </div>

          <div className="level-item">
            <h2 className="subtitle is-5">{tableHeader}</h2>
          </div>
        </div>
      </div>


      <div className="table-container">
        <table className="table is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th className={styles.keyColumn}>Key</th>
              <th className={styles.valueColumn}>Value</th>
              <th className={styles.commentColumn}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(TableRow)}
          </tbody>
        </table>
      </div>
    </div>
  );
}


const schema_url = "http://localhost:8000/api/schema"

const tables = [
  "general",
  "geometry",
  "volumetables",
  "numerics",
  "physics",
  "sediment",
  "waves",
  "time",
  "restart",
  "externalforcing",
  "hydrology",
  "trachytopes",
  "output",
]

const IndexPage = () => (
  <Layout>
    <div className="column">
      {
        tables.map(table_name => {
          return (
            <Table schema_location={new URL(`${schema_url}/mdu/${table_name}`)} />
          )
        })
      }
    </div>
  </Layout>
)

export default IndexPage
