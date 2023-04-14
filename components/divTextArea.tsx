import React, { useState, useRef, useEffect } from 'react';

interface ObjectWithUnknownDepth {
    [key: string]: any;
}

const DivTextArea = ({ value, onBlur, id, data, setError }) => {
    const divRef = useRef(null);

    useEffect(() => {
        if (divRef.current) {
            divRef.current.focus();
            setEndOfContentEditable(divRef.current);
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

    function modifyObjectValue(obj: ObjectWithUnknownDepth, keyPath: string[], value: any): ObjectWithUnknownDepth {
        const [currentKey, ...restKeys] = keyPath;
        if (!restKeys.length) {
            return {
                ...obj,
                [currentKey]: value,
            };
        }

        const currentObj = obj[currentKey];
        if (!currentObj || typeof currentObj !== 'object') {
            throw new Error(`Invalid key path: ${keyPath.join('/')}`);
        }

        const modifiedValue = modifyObjectValue(currentObj, restKeys, value);
        return {
            ...obj,
            [currentKey]: modifiedValue,
        };
    }


    const handleInputChange = async (event) => {
        const inputElement = event.target;
        const [key, language, ...rest] = inputElement.getAttribute('id').split('/');
        const oldValue = inputElement.getAttribute('data-prev-value'); // Get the previous value
        let updatedValue;
        if (rest.length !== 0) {
            updatedValue = JSON.stringify(modifyObjectValue({...data[key][language]}, rest, inputElement.textContent));
        } else {
            updatedValue = encodeURI(inputElement.textContent);
        }

        if (JSON.stringify(inputElement.textContent) !== oldValue) {
            inputElement.setAttribute('data-prev-value', JSON.stringify(inputElement.textContent));
            console.log("update");
            const res = await fetch(`api/update_key?key=${encodeURI(key)}&new_value=${updatedValue}&language=${encodeURI(language)}`, {
                method: 'PUT'
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Something went wrong');
                })
                .then((responseJson) => {
                    // Do something with the response
                })
                .catch((error) => {
                    console.log(error);
                    setError(`key: ${key} ${error}`);
                });
        }
    }

    const divOnBlur = (event) => {
        handleInputChange(event);
        onBlur(event);
    }

    return (
        <div
            ref={divRef}
            contentEditable
            onBlur={divOnBlur}
            id={id}
            className="rounded p-2 resize-none min-height-line text-sm w-full border focus:outline-none focus:border-indigo-300 whitespace-pre-wrap"
            suppressContentEditableWarning={true}
        >
            {value}
        </div>
    );
};

export default DivTextArea;