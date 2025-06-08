export default function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  getOptionValue = (option) => option.value,
  getOptionLabel = (option) => option.label,
  required = true,
  placeholder = "Выберите значение",
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label ">{label}</label>
      <select
        className="form-select "
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

  