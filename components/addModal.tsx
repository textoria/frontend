import React, { useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    syncData: () => void;
    template: string[];
}


const AddModal = ({ isOpen, closeModal, syncData, template}) => {
    const [keyData, setKeyData] = useState('');
    const [neutralFormData, setNeutralFormData] = useState({});
    const [genderFormData, setGenderFormData] = useState({});
    const [currentForm, setCurrentForm] = useState('neutral');


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
        console.log(JSON.stringify(data.new_values));
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

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (currentForm === 'neutral') {
            sendFormData({new_key: keyData, new_values: neutralFormData});
        } else {
            sendFormData({new_key: keyData, new_values: genderFormData});
        }
        setGenderFormData({});
        setNeutralFormData({});
        setKeyData('');
        setCurrentForm('neutral');
        closeModal();
    };

    if (!isOpen) return null;

    template.reverse().map((value)=> console.log(value));

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal}></div>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
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
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Key"
                                    required
                                />
                            </div>

                            {currentForm === 'neutral' ? (
                                <>
                                    {
                                        template.map((_, index) => {
                                            const value = template[template.length - 1 - index];
                                            return (
                                                <div className="mt-2" key={value}>
                                                    <input
                                                        type="text"
                                                        name={value}
                                                        onChange={handleNeutralFormChange}
                                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                        placeholder={value}
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
                                        template.map((_, index) => {
                                            const value = template[template.length - 1 - index]
                                            return (
                                                <React.Fragment key={value}>
                                                    <h4 className="text-lg leading-6 font-medium text-gray-900">{value}</h4>
                                                    <div className="mt-2" key={value}>
                                                        <input
                                                            type="text"
                                                            name={value+'/female'}
                                                            onChange={handleGenderFormChange}
                                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            placeholder={'female'}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            name={value+'/male'}
                                                            onChange={handleGenderFormChange}
                                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            placeholder={'male'}
                                                            required
                                                        />
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
                                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
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
