import getConfig from 'next/config';
import React from 'react';
import {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {createRoot} from "react-dom/client";

import AddModal from '../components/addModal';
import RemoveModal from "../components/removeModal";
// import DivTextArea from "../components/divTextArea";
import ScrollButton from "../components/scrollButton";


const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.API_BASE_URL;


interface JsonDataInterface {
  [key: string]: {
    [language: string]: string | Record<string, unknown>;
  };
}

interface ObjectWithUnknownDepth {
  [key: string]: any;
}

export default function Home({dataJson}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removedKey, setRemovedKey] = useState('');
  const [data, setData] = useState<JsonDataInterface>(dataJson);
  const [elementInFocus, setElementInFocus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [data, setData] = useState({
  //   "weekly_report_button": {
  //     "en": "📊 Reports",
  //     "ru": "📊 Статистика"
  //   },
  //   "weekly_report_locked_button": {
  //     "en": "🔒 Reports",
  //     "ru": "🔒 Статистика"
  //   },
  //   "what_is_alisa_button": {
  //     "en": "ℹ️ Who is Alice?",
  //     "ru": "ℹ️ Что такое Алиса?"
  //   },
  //   "whats_next_button": {
  //     "en": "😲 Ok, what to do after?",
  //     "ru": "😲 Ого, а что дальше?"
  //   },
  //   "wisdom_setting_disabled_button": {
  //     "en": "👁️ Show wisdoms",
  //     "ru": "👁️ Показывать мудрости"
  //   },
  //   "wisdom_setting_enabled_button": {
  //     "en": "🙈 Hide wisdoms",
  //     "ru": "🙈 Скрыть мудрости"
  //   },
  //   "working_hours_button": {
  //     "en": "📆 Working schedule",
  //     "ru": "📆 Рабочий график"
  //   },
  //   "write_me_button": {
  //     "en": "🤝 Yes, write to me",
  //     "ru": "🤝 Да, напиши мне"
  //   },
  //   "yes_button": {
  //     "en": "✅ Yes",
  //     "ru": "✅ Да"
  //   }
  // });
  const rootMap = new Map();

  // console.log(dataJson);


  useEffect(() => {
    scrollToElement(elementInFocus);
  },[elementInFocus]);
  const syncData = async (key: string) => {
    const res = await fetch(`api/get_all_keys`);
    const dataJson = await res.json();

    setData(dataJson);
    setElementInFocus(key);
  }


  const toggleEdit = (event, key, fieldValue) => {
    const spanElement = event.currentTarget;
    const textareaElement = document.createElement('textarea');
    textareaElement.setAttribute('data-prev-value', JSON.stringify(fieldValue));
    textareaElement.setAttribute('name', key);
    textareaElement.value = fieldValue;
    textareaElement.classList.add(
        'tracked-input',
        'block',
        'w-full',
        'rounded-md',
        // 'border',
        // 'border-gray-300',
        'py-1.5',
        'px-2',
        'text-sm',
        'text-gray-900',
        // 'shadow-sm',
        // 'ring-1',
        // 'ring-inset',
        // 'ring-gray-300',
        // 'placeholder-gray-400',
        // 'focus:outline-none',
        // 'focus:ring-2',
        // 'focus:ring-inset',
        // 'focus:ring-gray-600',
        // 'outline-none'
    );
    textareaElement.setAttribute('id', key);

    textareaElement.addEventListener('blur', () => {
      const newSpanElement = document.createElement('p');
      newSpanElement.innerText = textareaElement.value;
      newSpanElement.classList.add("text-sm", "text-gray-500", "border", "border-gray-300", "px-2", "py-1", "rounded", "cursor-pointer");
      newSpanElement.setAttribute('id', key);
      newSpanElement.addEventListener('click', (e) => toggleEdit(e, key, textareaElement.value));
      textareaElement.replaceWith(newSpanElement);
      handleInputChange({ target: textareaElement });
    });

    spanElement.replaceWith(textareaElement);

    textareaElement.style.height = 'auto';
    textareaElement.style.height = textareaElement.scrollHeight + 'px';
    textareaElement.focus();

  };

  // const toggleEdit = (event, key, fieldValue) => {
  //   const staticTextWrapper = event.currentTarget;
  //   const parentElement = staticTextWrapper.parentElement;
  //
  //   const handleBlur = () => {
  //     const newStaticTextWrapper = React.createElement(
  //         'p',
  //         {
  //           id: key,
  //           className: 'text-sm text-gray-500 border border-gray-300 px-2 py-1 rounded cursor-pointer',
  //           onClick: (e) => toggleEdit(e, key, dynamicTextWrapper.props.value),
  //         },
  //         dynamicTextWrapper.props.value
  //     );
  //
  //     const existingRoot = rootMap.get(parentElement);
  //     if (existingRoot) {
  //       existingRoot.render(newStaticTextWrapper);
  //     } else {
  //       const newRoot = createRoot(parentElement);
  //       rootMap.set(parentElement, newRoot);
  //       newRoot.render(newStaticTextWrapper);
  //     }
  //   };
  //
  //   const dynamicTextWrapper = React.createElement(DivTextArea, {
  //     value: fieldValue,
  //     onBlur: handleBlur,
  //   });
  //
  //   const existingRoot = rootMap.get(parentElement);
  //   if (existingRoot) {
  //     existingRoot.render(dynamicTextWrapper);
  //   } else {
  //     const newRoot = createRoot(parentElement);
  //     rootMap.set(parentElement, newRoot);
  //     newRoot.render(dynamicTextWrapper);
  //   }
  //
  //   // Remove the staticTextWrapper from the parent element
  //   parentElement.removeChild(staticTextWrapper);
  // };

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
      updatedValue = JSON.stringify(modifyObjectValue({...data[key][language]}, rest, inputElement.value));
    } else {
      updatedValue = encodeURI(inputElement.value);
    }

    if (JSON.stringify(inputElement.value) !== oldValue) {
      inputElement.setAttribute('data-prev-value', JSON.stringify(inputElement.value));
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
          console.log(error)
        });
    }
  }

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

  const templateValues = Object.keys(data[Object.keys(data)[0]]);

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
              <AddModal isOpen={isModalOpen} closeModal={closeModal} syncData={syncData} template={templateValues}/>
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
                    {
                      Object.entries(data[Object.keys(data)[0]]).map(([key, value]) => (
                        <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900" key={key}>
                          {key}
                        </th>
                      ))
                    }
                  </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                  {isLoading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                          <tr key={index} className="divide-x divide-gray-200">
                            <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-mono text-gray-900 sm:pl-0 blur opacity-50">
                              Loading...
                            </td>
                            <td className="p-4 text-sm text-gray-500 blur opacity-50">
                              <p className="text-sm text-gray-500">Loading...</p>
                            </td>
                            <td className='relative py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8 blur opacity-50 whitespace-nowrap'>
                              <a href="#" className="text-red-600 hover:text-red-900">
                                Loading...
                              </a>
                            </td>
                          </tr>
                      ))
                  ) : (
                      Object.entries(data).map(([key, value]) => (
                          <tr key={key} id={key} className="divide-x divide-gray-200">
                            <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-mono text-gray-900 sm:pl-0">
                              {key}
                            </td>
                            {
                              Object.entries(value).map(([translateKey, translateValue]) => (
                                <td className="p-4 text-sm text-gray-500" key={`${key}/${translateKey}`}>
                                  {typeof translateValue === 'object' ? (
                                      Object.entries(translateValue).map(([genderKey, genderValue]) => (
                                          <React.Fragment key={`${key}/${translateKey}/${genderKey}`}>
                                            <span className='text-red-600'>{genderKey}</span>
                                            <p className="text-sm text-gray-500 border border-gray-300 px-2 py-1 rounded cursor-pointer whitespace-pre-line"
                                               id={`${key}/${translateKey}/${genderKey}`}
                                               onClick={(e) => toggleEdit(e, `${key}/${translateKey}/${genderKey}`, genderValue)}>
                                            {genderValue}
                                            </p>
                                          </React.Fragment>
                                      ))
                                  ) : (
                                      <p className="text-sm text-gray-500 border border-gray-300 px-2 py-1 rounded cursor-pointer whitespace-pre-line"
                                         id={`${key}/${translateKey}`}
                                         onClick={(e) => toggleEdit(e, `${key}/${translateKey}`, translateValue)}>
                                        {translateValue}
                                      </p>
                                  )}

                                </td>
                              ))
                            }
                            <td className='relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8'>
                              <a href="#" className="text-red-600 hover:text-red-900" onClick={() => {
                                setIsRemoveModalOpen(true);
                                setRemovedKey(key);
                              }}>
                                Remove
                              </a>
                            </td>
                          </tr>
                          )
                      )
                    )}

                  </tbody>
                </table>
                <RemoveModal isOpen={isRemoveModalOpen} closeModal={closeRemoveModal} removedKey={removedKey}/>
                <ScrollButton />
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