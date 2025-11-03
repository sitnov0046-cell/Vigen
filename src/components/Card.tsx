interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg w-full max-w-md mx-auto ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
      )}
      {children}
    </div>
  );
}