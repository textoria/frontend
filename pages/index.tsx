import getConfig from 'next/config';
import React, {useEffect, useState} from "react";

import AddModal from '../components/addModal';
import Alert from "../components/alert";
import Table from "../components/table";


const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.API_BASE_URL;


interface JsonDataInterface {
  [key: string]: {
    [language: string]: string | Record<string, unknown>;
  };
}


export default function Home({dataJson}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<JsonDataInterface>(dataJson);
  const [elementInFocus, setElementInFocus] = useState('');
  // TODO create skeleton for loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  // const [data, setData] = useState({
  //   "weekly_report_button": {
  //     "en": {"female": 'big', 'male': 'cat'},
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


  useEffect(() => {
    scrollToElement(elementInFocus);
  },[elementInFocus]);

  const syncData = async (key = '') => {
    const res = await fetch(`api/get_all_keys`);
    const dataJson = await res.json();

    setData(dataJson);
    if (key) setElementInFocus(key);
  }

  const closeModal = () => {
    setIsModalOpen(false);

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
        <header className="fixed top-0 left-0 px-3 w-full h-16 bg-indigo-300 opacity-80 flex justify-center items-center z-50">
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
          </div>
        </header>
        <AddModal isOpen={isModalOpen} closeModal={closeModal} syncData={syncData} template={['ru', 'en']}/>
        <div className="mt-10 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
      <Table headings={['key', 'ru', 'en']} minCellWidth={150} data={data} setError={setError} syncData={syncData} />
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

