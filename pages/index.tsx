import getConfig from 'next/config';
import React from 'react';
import {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";

import AddModal from '../components/addModal';
import RemoveModal from "../components/removeModal";
import DivTextArea from "../components/divTextArea";
import ScrollButton from "../components/scrollButton";
import Alert from "../components/alert";


const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.API_BASE_URL;


interface JsonDataInterface {
  [key: string]: {
    [language: string]: string | Record<string, unknown>;
  };
}


export default function Home({dataJson}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removedKey, setRemovedKey] = useState('');
  const [data, setData] = useState<JsonDataInterface>(dataJson);
  const [elementInFocus, setElementInFocus] = useState('');
  // TODO create skeleton for loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
  },[error]);


  const syncData = async (key: string) => {
    const res = await fetch(`api/get_all_keys`);
    const dataJson = await res.json();

    setData(dataJson);
    setElementInFocus(key);

  }

  const toggleEdit = (event, key, fieldValue) => {
    const staticTextWrapper = event.currentTarget;
    const parentElement = staticTextWrapper.parentElement;
    const actualParentElement = staticTextWrapper.parentNode;


    const handleBlur = (event) => {
      const newStaticTextWrapper = React.createElement(
          'p',
          {
            id: key,
            className: 'text-sm text-gray-500 border border-gray-300 p-2 rounded cursor-pointer whitespace-pre-line min-height-line',
            onClick: (e) => toggleEdit(e, key, event.target.textContent),
          },
          event.target.textContent
      );

      const existingRoot = rootMap.get(parentElement);
      if (existingRoot) {
        existingRoot.render(newStaticTextWrapper);
      } else {
        const newRoot = createRoot(parentElement);
        rootMap.set(parentElement, newRoot);
        newRoot.render(newStaticTextWrapper);
      }

    };

    const dynamicTextWrapper = React.createElement(DivTextArea, {
      value: fieldValue,
      onBlur: handleBlur,
      id: key,
      data: data,
      setError
    });

    const existingRoot = rootMap.get(parentElement);
    if (existingRoot) {
      existingRoot.render(dynamicTextWrapper);
    } else {
      const newRoot = createRoot(parentElement);
      rootMap.set(parentElement, newRoot);
      newRoot.render(dynamicTextWrapper);
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

  const templateValues = Object.keys(data[Object.keys(data)[0]]);
  console.log(error);
  return (
      <div className="px-4 sm:px-6 lg:px-8 sm:pt-6">
        <header className="fixed top-0 left-0 px-3 w-full h-16 bg-indigo-300 opacity-80 flex justify-center items-center z-5">
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
        </header>
        <div className="mt-10 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>

                <tr className="divide-x divide-gray-200">
                  <th scope="col" className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900">
                    Key
                  </th>
                  {// hardcode reverse
                    Object.entries(data[Object.keys(data)[0]]).reverse().map(([key, value]) => (
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
                          <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-mono text-gray-900">
                            {key}
                          </td>
                          {// reverse hardcode
                            Object.entries(value).reverse().map(([translateKey, translateValue]) => (
                              <td className="p-4 text-sm text-gray-500" key={`${key}/${translateKey}`}>
                                {typeof translateValue === 'object' ? (
                                    Object.entries(translateValue).map(([genderKey, genderValue]) => (
                                        <React.Fragment key={`${key}/${translateKey}/${genderKey}`}>
                                          <span className='text-red-600'>{genderKey}</span>
                                          <p className="text-sm text-gray-500 border border-gray-300 p-2 rounded cursor-pointer whitespace-pre-line min-height-line"
                                             id={`${key}/${translateKey}/${genderKey}`}
                                             onClick={(e) => toggleEdit(e, `${key}/${translateKey}/${genderKey}`, genderValue)}>
                                          {genderValue}
                                          </p>
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 border border-gray-300 p-2 rounded cursor-pointer whitespace-pre-line min-height-line"
                                       id={`${key}/${translateKey}`}
                                       onClick={(e) => toggleEdit(e, `${key}/${translateKey}`, translateValue)}>
                                      {translateValue}
                                    </p>
                                )}

                              </td>
                            ))
                          }
                          <td className='whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8 z-1'>
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
              {error !== '' ? <Alert message={error}/>: ''}

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