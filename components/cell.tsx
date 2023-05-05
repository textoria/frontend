import { useState } from "react";
import DivTextArea from "./divTextArea";

interface CellProps {
    id: string;
    value: string;
    data: any;
    setError: (error: string) => void;
    syncData: () => void;
}

const Cell: React.FC<CellProps> = ({ id, value, data, setError, syncData }) => {
    const [editing, setEditing] = useState<boolean>(false);
    const [currentValue, setCurrentValue] = useState<string>(value);
    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        setEditing(false);
        setCurrentValue(event.target.textContent || "");
    };

    const handleClick = () => {
        setEditing(true);
    };

    return editing ? (
        <DivTextArea
            value={currentValue}
            onBlur={handleBlur}
            id={id}
            data={data}
            setError={setError}
            setValue={setCurrentValue}
            syncData={syncData}
        />
    ) : (
        <p
            className="text-sm text-gray-500 border border-gray-300 p-2 rounded cursor-pointer whitespace-pre-wrap break-all min-height-line"
            id={id}
            onClick={handleClick}
        >
            {currentValue}
        </p>
    );
};

export default Cell;