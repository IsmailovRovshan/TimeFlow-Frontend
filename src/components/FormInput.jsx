export default function FormInput({ id, label, value, onChange, type = "text", required = true, min }) {
    return (
      <div>
        <label htmlFor={id} className="form-label">{label}</label>
        <input
          type={type}
          className="form-control rounded-pill"
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          min={min}
        />
      </div>
    );
  }
  