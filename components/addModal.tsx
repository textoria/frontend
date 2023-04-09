import React, { useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    syncData: () => void;
    template: [string];
}

const AddModal = ({ isOpen, closeModal, syncData, template}) => {
    const [keyData, setKeyData] = useState('');
    const [values, setValues] = useState({});


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        if (name === 'new_key') {
            setKeyData(value);
            return;
        }

        setValues(prevValues => {
            return {
                ...prevValues,
                [name]: value
            }
        })
    };

    const sendFormData = async (data: { new_key: string; new_values: object }) => {
        console.log(JSON.stringify(data));
        // TODO: encode values
        const response = await fetch(`api/create_key?new_key=${data.new_key}&new_value=${data.new_values}`, {
            method: 'POST'
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
        sendFormData({new_key: keyData, new_values: values});
        closeModal();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal}></div>
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Create new pair</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="new_key"
                                    root-key={true}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Key"
                                    required
                                />
                            </div>
                            {
                                template.map((value) => (
                                    <div className="mt-2" key={value}>
                                        <input
                                            type="text"
                                            name={value}
                                            onChange={handleChange}
                                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                            placeholder={value}
                                            required
                                        />
                                    </div>
                                ))
                            }
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

export default AddModal
