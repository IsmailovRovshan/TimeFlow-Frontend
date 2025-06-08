export default function PageContainer({ title, children }) {
    return (
      <div className="container mt-4 ">
        <h1 className="mb-4">{title}</h1>
        {children}
      </div>
    );
  }
  