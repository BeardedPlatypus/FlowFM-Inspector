import * as React from "react"
import { useSpring, animated } from "react-spring"
import useResizeAware from 'react-resize-aware';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

import Layout from "../components/layout"
import "../styles/global.scss"
import * as styles from "./index.module.scss"


function InputNumberElement(data) {
  // TODO: add a separate integer.
  return (
    <div className="control is-expanded is-fullwidth">
      <input className="input has-text-right" defaultValue={data.defaultValue} type="number" />
    </div>
  )
}


function InputEnumElement(data) {
  // TODO: add name
  return (
    <div className="control is-expanded is-fullwidth">
      <div className="select is-fullwidth">
        <select className="is-fullwidth has-text-right" defaultValue={data.defaultValue}>
          {data.enumValues.map(v => {
            return (
              <option key={String(v)} value={v}>{v}</option>
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
        <select className="is-fullwidth has-text-right" defaultValue={data.defaultValue}>
          <option value={true}>True</option>
          <option value={false}>False</option>
        </select>
      </div>
    </div>
  )
}


function InputPathElement(props) {
  // TODO: add logic to add to the field.
  const handleChange = (event) => {
    props.value = event.target.value
  }

  const inputFile = React.useRef(null)

  const onButtonClick = () => {
    inputFile.current.click();
  }

  // TODO: replace this with the necessary logic to work with electron
  const onFileChange = (event) => {
    console.log(event.target.files)
  }

  // Empty file input is used by the button to actually open the file selector.
  return (
    <div className="field">
      <div className="control is-expanded is-fullwidth is-flex">
        <input className="input has-text-right flex-grow" value={props.value} onChange={handleChange} type="text" />
        <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} onChange={onFileChange} />
        <button className="button" onClick={onButtonClick}>...</button>
      </div>

    </div>
  )
}

function InputStringElement(props) {
  const handleChange = (event) => {
    props.value = event.target.value
  }

  return (
    <div className="control is-expanded is-fullwidth">
      <input className="input has-text-right" value={props.value} onChange={handleChange} type="text" />
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
    case "path":
      return InputPathElement(data)
    case "string":
    default:
      return InputStringElement(data)
  }
}

function TableRow(props) {
  return (
    <tr>
      <td className={styles.keyColumn}>{props.rowKey}</td>
      <td className={styles.valueColumn}>{InputElement(props)}</td>
      <td className={styles.commentColumn}><input className="input" defaultValue={props.comment} /></td>
    </tr>
  )
}

function RetrieveHeader(data) {
  return data.title;
}


function GetValueType(value) {
  const is_enum = "enum" in value

  if (is_enum) return "enum"
  if (value.type === "string" && value.format === "path") return "path"
  return value.type
}


function MapToRow(table, [key, value]) {

  return {
    table: table,
    rowKey: key,
    defaultValue: value.default,
    valueType: GetValueType(value),
    enumValues: value.enum,
  }
}

function RetrieveRows(data) {
  return Object.entries(data.properties).map(v => MapToRow(data.title, v));
}


const GetRowValue = (data, key, default_value) => {
  if (data == null || data[key.toLowerCase()] == null) {
    if (default_value == null) {
      return ""
    }
    return default_value
  }

  return data[key.toLowerCase()]
}


const GetCommentValue = (data, key) => (data == null || data.comments == null || data.comments[key.toLowerCase()] == null) ? "" : data.comments[key.toLowerCase()];

function Table(props) {
  const [tableHeader, setTableHeader] = React.useState("")
  const [tableRows, setTableRows] = React.useState([])
  const [isCollapsed, setCollapsed] = React.useState(true)


  React.useEffect(() => {
    fetch(props.schema_location)
      .then(response => response.json())
      .then(data => {
        setTableHeader(RetrieveHeader(data));
        setTableRows(RetrieveRows(data))
      })

  }, []);

  const [resizeListener, sizes] = useResizeAware();
  let restoreHeight = sizes.height

  const { rotate, opacity, transform, height } = useSpring({
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
              <animated.div style={{ rotate }} on={{ isCollapsed }}>
                <FontAwesomeIcon icon={faCaretDown} />
              </animated.div>
            </div>

            <div className="level-item">
              <h2 className="subtitle is-4">{tableHeader}</h2>
            </div>
          </div>
        </button>

        <animated.div style={{ overflow: 'hidden', opacity, transform, height }} on={{ isCollapsed }}>
          <div className="table-container ml-6 mr-6 pb-4 pt-4" style={{ position: 'relative' }}>
            {resizeListener}
            <table className="table is-hoverable is-fullwidth">
              <thead>
                <tr>
                  <th className={styles.keyColumn}>Key</th>
                  <th className={styles.valueColumn}>Value</th>
                  <th className={styles.commentColumn}>Comment</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((rowProps) => <TableRow key={`Table_${rowProps.table}_${rowProps.rowKey}`} value={GetRowValue(props.model_data, rowProps.rowKey, rowProps.defaultValue)} comment={GetCommentValue(props.model_data, rowProps.rowKey)} {...rowProps} />)}
              </tbody>
            </table>
          </div>
        </animated.div>
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

const models_url = "http://localhost:8000/api/models"

function IndexPage() {
  const [modelData, setModelData] = React.useState({})

  React.useEffect(() => {
    fetch(new URL(models_url))
      .then(response => response.json())
      .then(data => {
        fetch(new URL(`${models_url}/${data.models[0]}`))
          .then(response => response.json())
          .then(data => {
            console.log(data)
            setModelData(data)
          })
      })
  }, []);

  return (
    <Layout>
      <div className="column">
        {
          tables.map(table_name => {
            return (
              <Table key={`Table_${table_name}`} model_data={modelData[table_name]} schema_location={new URL(`${schema_url}/mdu/${table_name}`)} />
            )
          })
        }
      </div>
    </Layout>
  );
}

export default IndexPage
