import getConfig from 'next/config';
import {useEffect, useState} from "react";
import Modal from '../components/modal';
import RemoveModal from "../components/removeModal";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.API_BASE_URL;


interface JsonDataInterface {
  key: string;
  value: string;
}

export default function Home({dataJson}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removedKey, setRemovedKey] = useState('');
  const [data, setData] = useState<JsonDataInterface>(dataJson);
  const [elementInFocus, setElementInFocus] = useState('');

  useEffect(() => {
    scrollToElement(elementInFocus);
  },[elementInFocus]);
  const addData = async (key: string, newValue: string) => {
    const res = await fetch(`api/get_all_keys`);
    const dataJson = await res.json();
    console.log(dataJson);

    setData(dataJson);
    setElementInFocus(key);
  }

  const toggleEdit = (event, key, fieldValue) => {
    const spanElement = event.currentTarget;
    const textareaElement = document.createElement('textarea');
    textareaElement.setAttribute('data-prev-value', fieldValue);
    textareaElement.setAttribute('name', key);
    textareaElement.value = fieldValue;
    textareaElement.classList.add(
        'block',
        'w-full',
        'rounded-md',
        'border-0',
        'py-1.5',
        'text-gray-900',
        'shadow-sm',
        'ring-1',
        'ring-inset',
        'ring-gray-300',
        'placeholder:text-gray-400',
        'focus:ring-2',
        'focus:ring-inset',
        'focus:ring-indigo-600',
        'sm:text-sm',
        'sm:leading-6'
    );

    textareaElement.addEventListener('blur', () => {
      const newSpanElement = document.createElement('p');
      newSpanElement.innerText = textareaElement.value;
      newSpanElement.classList.add('text-sm', 'text-gray-500');
      newSpanElement.addEventListener('click', (e) => toggleEdit(e, key, textareaElement.value));
      textareaElement.replaceWith(newSpanElement);
      handleInputChange({ target: textareaElement });
    });

    spanElement.replaceWith(textareaElement);
    textareaElement.style.height = 'auto';
    textareaElement.style.height = textareaElement.scrollHeight + 'px';
    textareaElement.focus();
  };

  const handleInputChange = async (event) => {
    const inputElement = event.target;
    const oldValue = inputElement.getAttribute('data-prev-value'); // Get the previous value
    const newValue = inputElement.value;

    if (newValue !== oldValue) {
      inputElement.setAttribute('data-prev-value', newValue);
      console.log("update");
      const res = await fetch(`api/update_key?key=${inputElement.id}&new_value=${encodeURIComponent(newValue)}`, {
        method: 'PUT'
      }).then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Something went wrong');
      })
          .then((responseJson) => {
            // Do something with the response
          })
          .catch((error) => {
            console.log(error)
          });
    }

  };

  const closeModal = () => {
    setIsModalOpen(false);

  }
  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
  }

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setElementInFocus('');
    }

  };

  return (
      <div className="px-4 sm:px-6 lg:px-8 sm:pt-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <p className="mt-2 text-sm text-gray-700">
                TEXTORIA
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                  className="bg-indigo-600 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setIsModalOpen(true)}
              >
                Add key
              </button>
              <Modal isOpen={isModalOpen} closeModal={closeModal} addData={addData} />
            </div>
          </div>
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                  <tr className="divide-x divide-gray-200">
                    <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Key
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Value
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                  {Object.entries(data).map(([key, fieldValue]) => (
                      <tr key={key} id={key} className="divide-x divide-gray-200">
                        <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-mono text-gray-900 sm:pl-0">
                          {key}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          <p className="text-sm text-gray-500" onClick={(e) => toggleEdit(e, key, fieldValue)}>
                          {fieldValue}
                        </p>
                        </td>
                        <td className='relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'>
                          <a href="#" className="text-red-600 hover:text-red-900" data-key={key} onClick={() => {
                            setIsRemoveModalOpen(true);
                            setRemovedKey(key);
                          }}>
                            Remove
                          </a>
                        </td>
                      </tr>
                  ))}

                  </tbody>
                </table>
                <RemoveModal isOpen={isRemoveModalOpen} closeModal={closeRemoveModal} removedKey={removedKey}/>

              </div>
            </div>
          </div>
        </div>
  );
}


export async function getServerSideProps() {
  const res = await fetch(`${API_BASE_URL}/get_all_keys`);
  const dataJson = await res.json();

  return { props: { dataJson } }
}