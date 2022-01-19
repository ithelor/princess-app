interface IDropdownSelect {
  list: string[]
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  current: string
}

const DropdownSelect = (props: IDropdownSelect) => {
  return (
    <select onChange={props.onChange} defaultValue={props.current}>
      {props.list.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  )
}

export default DropdownSelect