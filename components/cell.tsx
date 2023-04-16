import React, { useState } from "react";
import DivTextArea from "./divTextArea";

interface CellProps {
    id: string;
    value: string;
    data: any;
    setError: (error: string) => void;
}

const Cell = ({ id, value, data, setError }) => {
    const [editing, setEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    const handleBlur = (event) => {
        setEditing(false);
        setCurrentValue(event.target.textContent);
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