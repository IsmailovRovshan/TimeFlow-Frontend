export function MyButton({ text, setText }) {
    const handleClick = () => setText(text);
    return (
      <div>
        <button onClick={handleClick}>Click</button>
      </div>
    );
  }