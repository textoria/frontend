import React, { useRef, useEffect } from 'react';


const DivTextArea = ({ value, onBlur, id, data, setError, setValue, syncData }) => {
    const divRef = useRef(null);

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


    const setEndOfContentEditable = (element) => {
        let range, selection;
        // if (document.createRange) {
        range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        // } else if (document.selection) { // IE fallback
        //     range = document.body.createTextRange();
        //     range.moveToElementText(element);
        //     range.collapse(false);
        //     range.select();
        // }
    };

    const handleInputChange = async (event) => {
        const inputElement = event.target;
        const [key, language, gender] = inputElement.getAttribute('id').split('/');
        let updatedValue;
        let compareValue;
        if (gender) {
            updatedValue = {...data[key][language]};
            updatedValue[gender] = inputElement.textContent;
            compareValue = encodeURI(updatedValue[gender]);
            updatedValue = JSON.stringify(updatedValue);
        } else {
            updatedValue = inputElement.textContent;
            compareValue = encodeURI(updatedValue);
        }

        if (compareValue !== encodeURI(value)) {
            inputElement.setAttribute('data-prev-value', JSON.stringify(inputElement.textContent));
            console.log("update");

            const res = await fetch(`api/update_key?key=${encodeURI(key)}&new_value=${encodeURI(updatedValue)}&language=${encodeURI(language)}`, {
                method: 'PUT'
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Something went wrong');
                    }
                })
                .then((responseJson) => {
                    syncData();
                })
                .catch((error) => {
                    console.log(error);
                    setValue(value);
                    setError(`${new Date().toLocaleTimeString()} key: ${key} ${error}`);
                });
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && event.metaKey) {
            divRef.current.blur();
        }
    }

    const handleWindowClick = (event) => {

        if (divRef.current && !divRef.current.contains(event.target)) {
            divRef.current.blur();
        } else if (divRef.current && divRef.current.contains(event.target)) {
            event.stopPropagation();
        }
    };

    const divOnBlur = (event) => {
        handleInputChange(event);
        onBlur(event);
    }

    const handleDivClick = (event) => {
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
            className="rounded p-2 resize-none min-height-line text-sm w-full
             border focus:outline-none focus:border-indigo-300 break-all whitespace-pre-wrap"
            suppressContentEditableWarning={true}
            onClick={handleDivClick}
        >
            {value}
        </div>
    );
};

export default DivTextArea;