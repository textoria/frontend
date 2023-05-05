import { useRef, useEffect } from 'react';

interface DivTextAreaProps {
    value: string;
    onBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
    id: string;
    data: any;
    setError: (error: string) => void;
    setValue: (value: string) => void;
    syncData: () => void;
}

const DivTextArea: React.FC<DivTextAreaProps> = ({ value, onBlur, id, data, setError, setValue, syncData }) => {
    const divRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (divRef.current) {
            divRef.current.focus();
            setEndOfContentEditable(divRef.current);
        }
        window.addEventListener('mousedown', handleWindowClick);
        return () => {
            window.removeEventListener('mousedown', handleWindowClick);
        }
    }, []);

    const setEndOfContentEditable = (element: HTMLElement) => {
        let range: Range;
        let selection: Selection;
        range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection = window.getSelection()!;
        selection.removeAllRanges();
        selection.addRange(range);
    };

    const handleInputChange = async (event: React.SyntheticEvent<HTMLDivElement>) => {
        const inputElement = event.target as HTMLDivElement;
        const [key, language, gender] = inputElement.getAttribute('id')!.split('/');
        let updatedValue: string | object;
        let compareValue: string;
        if (gender) {
            updatedValue = { ...data[key][language] };
            updatedValue[gender] = inputElement.textContent;
            compareValue = encodeURI(updatedValue[gender]);
            updatedValue = JSON.stringify(updatedValue);
        } else {
            updatedValue = inputElement.textContent || "";
            compareValue = encodeURI(updatedValue);
        }

        if (compareValue !== encodeURI(value)) {
            inputElement.setAttribute('data-prev-value', JSON.stringify(inputElement.textContent));
            console.log("update");

            await fetch(`api/update_key?key=${encodeURI(key)}&new_value=${encodeURI(updatedValue)}&language=${encodeURI(language)}`, {
                method: 'PUT'
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Something went wrong');
                    }
                })
                .then(() => {
                    syncData();
                })
                .catch((error) => {
                    console.log(error);
                    setValue(value);
                    setError(`${new Date().toLocaleTimeString()} key: ${key} ${error}`);
                });
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && event.metaKey) {
            divRef.current!.blur();
        }
    }

    const handleWindowClick = (event: MouseEvent) => {

        if (divRef.current && !divRef.current.contains(event.target as Node)) {
            divRef.current.blur();
        } else if (divRef.current && divRef.current.contains(event.target as Node)) {
            event.stopPropagation();
        }
    };

    const divOnBlur = (event: React.FocusEvent<HTMLDivElement>) => {
        handleInputChange(event).then();
        onBlur(event);
    }

    const handleDivClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (divRef.current) {
            divRef.current.focus();
        }
    };

    return (
        <div
            ref={divRef}
            contentEditable
            onBlur={divOnBlur}
            id={id}
            onKeyDown={handleKeyDown}
            className="rounded p-2 resize-none min-height-line text-sm

             border focus:outline-none focus:border-indigo-300 break-all whitespace-pre-wrap"
            suppressContentEditableWarning={true}
            onClick={handleDivClick}
        >
            {value}
        </div>
    );
};

export default DivTextArea;