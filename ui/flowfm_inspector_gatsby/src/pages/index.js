import * as React from "react"

import Layout from "../components/layout"
import "../styles/global.scss"


function TableRow(props) {
  return (
    <tr key={`Table_${props.table}_${props.key}`}>
      <td>{props.key}</td>
      <td><input className="input" value={props.value} /></td>
      <td><input className="input" value={(props.comment === undefined) ? "" : props.comment} /></td>
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

const general_schema = new URL("http://localhost:8000/api/schema/general");

function Table(props) {
  const [tableHeader, setTableHeader] = React.useState("")
  const [tableRows, setTableRows] = React.useState([])

  React.useEffect(() => {
    console.log(props.schema_location);
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
              <th>Key</th>
              <th>Value</th>
              <th>Comment</th>
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


/*
const rows = [
  { key: "fileVersion", value: "1.09" },
  { key: "fileType", value: "modelDef" },
  { key: "program", value: "D-Flow FM" },
  { key: "version", value: "1.2.94.66079M" },
  { key: "autoStart", value: false },
  { key: "pathsRelativeToParent", value: false },
]
*/


/*
const placeholder_data = {
  "title": "General",
  "properties": {
    "fileVersion": { "title": "Fileversion", "default": "1.09", "type": "string" },
    "fileType": { "title": "Filetype", "default": "modelDef", "enum": ["modelDef"], "type": "string" },
    "program": { "title": "Program", "default": "D-Flow FM", "type": "string" },
    "version": { "title": "Version", "default": "1.2.94.66079M", "type": "string" },
    "autoStart": { "title": "Autostart", "default": false, "type": "boolean" },
    "pathsRelativeToParent": { "title": "Pathsrelativetoparent", "default": false, "type": "boolean" }
  },
}
*/


const IndexPage = () => (
  <Layout>
    <div className="column">
      <Table schema_location={general_schema} />
    </div>
  </Layout>
)

export default IndexPage
