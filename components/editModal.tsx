import React, { useState, useEffect } from 'react';
import {XMarkIcon, PlusIcon} from "@heroicons/react/24/solid";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    syncData: () => void;
    template: string[];
}


const EditModal = ({ isOpen, closeModal, syncData, dataFields, pairKey, language, setError }) => {
    const [newField, setNewField] = useState('');
    const [fields, setFields] = useState(dataFields);

    const [inputValues, setInputValues] = useState({});

    useEffect(() => {
        setFields(dataFields);
        setInputValues(Object.keys(dataFields).reduce((acc, key) => {
            acc[key] = key;
            return acc;
        }, {}));
    }, [dataFields]);

    const handleAddField = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Add this line to stop event propagation
        if (newField) {
            setFields({...fields, [newField]: ''});
            setInputValues((prevInputValues) => {
                return { ...prevInputValues, [newField]: newField };
            });
            setNewField('');
        }
    };

    const handleRemoveField = (keyToRemove: string) => {
        if (Object.keys(fields).length === 2) {
            setFields((prevFields) => {
                const updatedFields = { ...prevFields };
                delete updatedFields[keyToRemove];
                return {'default': Object.values(updatedFields)[0]};
            });
            setInputValues({'default': 'default'});
            return;
        }
        setFields((prevFields) => {
            const updatedFields = { ...prevFields };
            delete updatedFields[keyToRemove];
            return updatedFields;
        });

        setInputValues((prevInputValues) => {
            const updatedInputValues = { ...prevInputValues };
            delete updatedInputValues[keyToRemove];
            return updatedInputValues;
        });
    };

    const handleChangeField = (event, key) => {
        setInputValues(prevInputValues => ({
            ...prevInputValues,
            [key]: event.target.value,
        }));
    };

    const haveIdenticalKeysAndValues = (obj1, obj2) => {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    };

    const sendFormData = async (fieldsValue, fieldsKeys, initFields) => {
        let updatedFields = {};
        Object.entries(fieldsValue).map(([key, value]) => {
            if (fieldsKeys[key]) updatedFields[fieldsKeys[key]] = value;
        })

        if (!haveIdenticalKeysAndValues(updatedFields, initFields)) {
            console.log("update fields");
            if (Object.keys(updatedFields).length === 1) {
                updatedFields = updatedFields['default'];
            } else {
                updatedFields = JSON.stringify(updatedFields);
            }

            const res = await fetch(`api/update_key?key=${encodeURI(pairKey)}&new_value=${encodeURI(updatedFields)}&language=${encodeURI(language)}`, {
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
                    // setValue(value);
                    setError(`${new Date().toLocaleTimeString()} key: ${pairKey} ${error}`);
                });
        }
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        sendFormData(fields, inputValues, dataFields);
        closeModal();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal}></div>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden
                 shadow-xl transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        <div className="flex justify-between items-center">

                            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit fields</h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {
                                Object.keys(fields).length == 1 ? (
                                    <React.Fragment key={language}>

                                        <div className="mt-2 flex flex-row items-center">
                                            <input
                                                type="text"
                                                name={'default'}
                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mr-2"
                                                placeholder={'default'}
                                                disabled
                                            />
                                        </div>
                                    </React.Fragment>
                                ) : (
                                    Object.entries(fields).map(([key, value]) => {
                                        return (
                                            <React.Fragment key={key}>
                                                <div className="mt-2 flex flex-row items-center">
                                                    <input
                                                        type="text"
                                                        name={key}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                                                        block w-full sm:text-sm border-gray-300 rounded-md mr-2"
                                                        onChange={(event) => handleChangeField(event, key)}
                                                        value={inputValues[key]}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="rounded-full bg-red-600 p-1 text-white shadow-sm
                                                        hover:bg-red-500 focus-visible:outline focus-visible:outline-2
                                                        focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                                        onClick={() => handleRemoveField(key)}
                                                    >
                                                        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </React.Fragment>
                                        )
                                    })
                                )
                            }
                            <div className="mt-2 flex flex-row items-center">
                                <input type="text"
                                       value={newField}
                                       className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                                                                      block w-full sm:text-sm border-gray-300 rounded-md mr-2"
                                       onChange={(e) => setNewField(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="rounded-full bg-green-600 p-1 text-white shadow-sm
                                                                         hover:bg-green-500 focus-visible:outline focus-visible:outline-2
                                                                         focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                    onClick={(event) => handleAddField(event)}                                                        >
                                    <PlusIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center w-full rounded-md border border-transparent
                                    shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700
                                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
