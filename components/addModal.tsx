import React, { useState } from 'react';
import {XMarkIcon, PlusIcon} from "@heroicons/react/24/solid";

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    syncData: () => void;
    template: string[];
}


const AddModal = ({ isOpen, closeModal, syncData, template}) => {
    const [keyData, setKeyData] = useState('');
    const [neutralFormData, setNeutralFormData] = useState({ru: '', en: ''});
    const [genderFormData, setGenderFormData] = useState({ru: {female: '', male: ''}, en: {female: '', male: ''}});
    const [currentForm, setCurrentForm] = useState('neutral');
    const [fields, setFields] = useState({'en': ['female', 'male'], 'ru': ['female', 'male']});
    const [newFields, setNewFields] = useState({'en': '', 'ru': ''});

    const handleAddField = (e, language) => {
        e.preventDefault();
        if (newFields[language]) {
            setFields(prevState => {
                const updatedFields = {...prevState};
                updatedFields[language] = [...prevState[language], newFields[language]];
                return updatedFields;
            });
            setNewFields(prevState => {
                const updatedNewFields = {...prevState};
                updatedNewFields[language] = '';
                return updatedNewFields;
            });
        }
    };

    const removeField = (index: number, language) => {
        // console.log(fields);
        // console.log(genderFormData);
        if (fields[language].length === 2) {
            setGenderFormData(prevState => {
                const fieldToDelete = fields[language][index];
                const updatedFields = {...prevState};
                if (updatedFields[language]) {
                    delete updatedFields[language][fieldToDelete];
                    updatedFields[language] = {'default': Object.values(updatedFields[language])[0]};
                    return updatedFields;
                }
            });

            setFields(prevState => {
                const updatedFields = {...prevState};
                updatedFields[language] = ['default'];
                return updatedFields;
            });
            return;
        }
        setGenderFormData(prevState => {
            const fieldToDelete = fields[language][index];
            const updatedFields = {...prevState};
            delete updatedFields[language][fieldToDelete];
            return updatedFields;
        });

        setFields(prevState => {
            const updatedFields = {...prevState};
            updatedFields[language] = prevState[language].filter((_, i) => i !== index);
            return updatedFields;
        });


    };


    const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setKeyData(event.target.value);
    }

    const handleNeutralFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setNeutralFormData(prevValues => {
            return {
                ...prevValues,
                [name]: value
            }
        });
    };
    const handleGenderFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        const [language, gender] = name.split('/');
        setGenderFormData(prevValues => {
            return {
                ...prevValues,
                [language]: {
                    ...prevValues[language],
                    [gender]: value
                }
            }
        })
    };

    const toggleForm = () => {
        setCurrentForm((prevForm) => (prevForm === 'neutral' ? 'gender' : 'neutral'));
    };


    const sendFormData = async (data: { new_key: string; new_values: object }) => {
        console.log(data.new_values);
        const response = await fetch(
            `api/create_key?new_key=${encodeURI(data.new_key)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data.new_values)
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok');
        })
        .then((responseJson) => {
            syncData(data.new_key);
        })
        .catch((error) => {
            console.log(error)
        });

    };

    const resetForm = () => {
        setGenderFormData({ru: {female: '', male: ''}, en: {female: '', male: ''}});
        setNeutralFormData({ru: '', en: ''});
        setFields({'en': ['female', 'male'], 'ru': ['female', 'male']});
        setNewFields({'en': '', 'ru': ''});
        setKeyData('');
        setCurrentForm('neutral');
    }

    const prepareData = () => {
        let newData = {}
        template.forEach((language) => {
            if (fields[language].length === 1) {
                newData[language] = genderFormData[language]['default'];
                return;
            }
            newData[language] = genderFormData[language];
        })
        return newData;
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (currentForm === 'neutral') {
            sendFormData({new_key: keyData, new_values: neutralFormData});
        } else {
            const preparedData = prepareData();
            sendFormData({new_key: keyData, new_values: preparedData});
        }
        resetForm();
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

                            <h3 className="text-lg leading-6 font-medium text-gray-900">Create new pair</h3>
                            <button
                                onClick={toggleForm}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
                            >
                                Toggle Form
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="new_key"
                                    onChange={handleKeyChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full
                                     sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Key"
                                    value={keyData}
                                    required
                                />
                            </div>

                            {currentForm === 'neutral' ? (
                                <>
                                    {
                                        template.map((value) => {
                                            return (
                                                <div className="mt-2" key={value}>
                                                    <input
                                                        type="text"
                                                        name={value}
                                                        onChange={handleNeutralFormChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                        placeholder={value}
                                                        value={neutralFormData[value]}
                                                        required
                                                    />
                                                </div>
                                            )
                                        })
                                    }
                                </>
                            ) : (
                                <>
                                    {
                                        template.map((language) => {
                                            return (
                                                <React.Fragment key={language}>
                                                    <h4 className="text-lg leading-6 font-medium text-purple-900 uppercase my-2">{language}</h4>
                                                    {
                                                        fields[language].length === 1 ? (
                                                            fields[language].map((key, index) => (
                                                                    <React.Fragment key={`${language}/${key}`}>
                                                                        <div className="mt-2 flex flex-row items-center" key={`${language}/${key}`}>
                                                                            <input
                                                                                type="text"
                                                                                name={`${language}/${key}`}
                                                                                onChange={handleGenderFormChange}
                                                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                                                                            block w-full sm:text-sm border-gray-300 rounded-md"
                                                                                placeholder={key}
                                                                                value={genderFormData[language][key]}
                                                                                required
                                                                            />
                                                                        </div>

                                                                    </React.Fragment>
                                                                )
                                                            )
                                                        ) : (
                                                            fields[language].map((key, index) => (
                                                                    <React.Fragment key={`${language}/${key}`}>
                                                                        <h6 className="text-lg leading-6 font-medium text-gray-900">{key}</h6>

                                                                        <div className="mt-2 flex flex-row items-center" key={`${language}/${key}`}>
                                                                            <input
                                                                                type="text"
                                                                                name={`${language}/${key}`}
                                                                                onChange={handleGenderFormChange}
                                                                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                                                                            block w-full sm:text-sm border-gray-300 rounded-md mr-2"
                                                                                placeholder={key}
                                                                                value={genderFormData[language][key]}
                                                                                required
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                className="rounded-full bg-red-600 p-1 text-white shadow-sm
                                                                         hover:bg-red-500 focus-visible:outline focus-visible:outline-2
                                                                         focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                                                                onClick={() => removeField(index, language)}
                                                                            >
                                                                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                                                                            </button>
                                                                        </div>

                                                                    </React.Fragment>
                                                                )
                                                            )

                                                        )
                                                    }
                                                    <div className="mt-2 flex flex-row items-center">
                                                        <input type="text"
                                                               value={newFields[language]}
                                                               className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500
                                                                      block w-full sm:text-sm border-gray-300 rounded-md mr-2"
                                                               onChange={(e) => setNewFields(prevState => {
                                                                   const updatedNewFields = {...prevState};
                                                                   updatedNewFields[language] = e.target.value;
                                                                   return updatedNewFields;
                                                               })}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="rounded-full bg-green-600 p-1 text-white shadow-sm
                                                                         hover:bg-green-500 focus-visible:outline focus-visible:outline-2
                                                                         focus-visible:outline-offset-2 focus-visible:outline-green-600"
                                                            onClick={(event) => handleAddField(event, language)}                                                        >
                                                            <PlusIcon className="h-4 w-4" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </React.Fragment>


                                            )
                                        })
                                    }

                                </>
                            )}
                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center w-full rounded-md border border-transparent
                                    shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700
                                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddModal;
