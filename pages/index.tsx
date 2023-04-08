import { useEffect } from 'react';
import getConfig from 'next/config';


const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.API_BASE_URL;

interface JsonData {
  [key: string]: string
}

export default function Home({dataJson}) {
  const toggleEdit = (event, key, fieldValue) => {
    const spanElement = event.currentTarget;
    const textareaElement = document.createElement('textarea');
    textareaElement.setAttribute('data-prev-value', fieldValue);
    textareaElement.setAttribute('name', key);
    textareaElement.setAttribute('id', key);
    textareaElement.value = fieldValue;
    textareaElement.classList.add(
        'tracked-input',
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
      newSpanElement.addEventListener('click', (e) => toggleEdit(e, key, fieldValue));
      textareaElement.replaceWith(newSpanElement);
      handleInputChange({ target: textareaElement });
    });

    spanElement.replaceWith(textareaElement);
    textareaElement.style.height = 'auto';
    textareaElement.style.height = textareaElement.scrollHeight + 'px';
    textareaElement.focus();
  };

  useEffect(() => {
    const parentElement = document.getElementById('input-container');

    if (parentElement) {
      parentElement.addEventListener('input', (event) => {
        if ((event.target as HTMLElement).classList.contains('tracked-input')) {
          handleInputChange(event);
        }
      });
    }

    return () => {
      if (parentElement) {
        parentElement.removeEventListener('input', handleInputChange);
      }
    };
  }, [dataJson]);

  // if (error) return <div>Failed to load</div>;
  //
  // if (!data) return <div>Loading...</div>;

  const handleInputChange = async (event) => {
    const inputElement = event.target;
    const oldValue = inputElement.getAttribute('data-prev-value'); // Get the previous value
    const newValue = inputElement.value;

    if (newValue !== oldValue) {
      inputElement.setAttribute('data-prev-value', newValue);
      const res = await fetch(`api/update?key=${inputElement.id}&new_value=${newValue}`, {
        method: 'PUT',
        headers:{
          'Content-Type':'application/json'
        },
      });
    }
  };

  return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the users in your account including their name, title, email and role.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
                type="button"
                className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold
                 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2
                  focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add user
            </button>
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
                <tbody className="divide-y divide-gray-200 bg-white" id="input-container">
                {Object.entries(dataJson).map(([key, fieldValue]) => (
                    <tr key={key} className="divide-x divide-gray-200">
                      <td className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-0">
                        {key}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        <p className="text-sm text-gray-500" onClick={(e) => toggleEdit(e, key, fieldValue)}>
                        {fieldValue}
                      </p>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}


export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`${API_BASE_URL}/get_all_keys`);
  const dataJson = await res.json();

  // Pass data to the page via props
  return { props: { dataJson } }
}