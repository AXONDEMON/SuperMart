export function Card({ children }) {
    return <div className="border p-4 shadow-md rounded-lg bg-white dark:bg-gray-800">{children}</div>;
}

export function CardContent({ children }) {
    return <div className="p-4">{children}</div>;
}

export default Card;
