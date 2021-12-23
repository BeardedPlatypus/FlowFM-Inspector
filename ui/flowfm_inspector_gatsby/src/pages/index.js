import * as React from "react"

import Layout from "../components/layout"
import "../styles/global.scss"
import * as styles from "./index.module.scss"


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
      <input className="input has-text-right" value={data.value} />
    </div>
  )
}


function InputElement(data) {
  switch (data.valueType) {
    case "boolean":
      return InputBooleanElement(data)
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
  return {
    table: table,
    key: key,
    value: value.default,
    valueType: value.type
  }
}

function RetrieveRows(data) {
  return Object.entries(data.properties).map(v => MapToRow(data.title, v));
}

function Table(props) {
  const [tableHeader, setTableHeader] = React.useState("")
  const [tableRows, setTableRows] = React.useState([])

  React.useEffect(() => {
    console.log(props.schema_location)

    fetch(props.schema_location)
      .then(response => response.json())
      .then(data => {
        setTableHeader(RetrieveHeader(data));
        setTableRows(RetrieveRows(data))
      })

  }, []);

  return (
    <div key={`Table_${tableHeader}`}>
      <h2 className="subtitle is-5">{tableHeader}</h2>
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

const tables = [
  "general",
  "volumetables",
  "numerics",
  "physics",
  "sediment",
  "waves",
  "time",
  "restart",
  "external_forcing",
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
            <Table schema_location={new URL(`http://localhost:8000/api/schema/${table_name}`)} />
          )
        })
      }
    </div>
  </Layout>
)

export default IndexPage
