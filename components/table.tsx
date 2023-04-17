import React, { useEffect, useState, useRef, useCallback } from "react";
import {EllipsisVerticalIcon} from "@heroicons/react/24/solid";

import Cell from "./cell";
import RemoveModal from "./removeModal";
import ScrollButton from "./scrollButton";
import EditModal from "../components/editModal";



const createHeaders = (headers) => {
    return headers.map((item) => ({
        text: item,
        ref: useRef(),
    }));
}


const Table = ({ headings, minCellWidth, data, setError, syncData }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const columns = createHeaders(headings);
    const [columnsWidth, setColumnsWidth] = useState([]);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [removedKey, setRemovedKey] = useState('');
    const [frame, setFrame] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState({});


    const closeRemoveModal = () => {
        setIsRemoveModalOpen(false);
    }

    const mouseDown = (index) => {
        setActiveIndex(index);
    }

    const mouseMove = useCallback(
        (e) => {
            if (frame) {
                if (typeof frame === "number") {
                    cancelAnimationFrame(frame);
                }
            }

            setFrame(
                requestAnimationFrame(() => {
                    let nextColumnNewWidth = null;
                    let changed = false;
                    const gridColumns = columns.map((col, i) => {
                        if (i === activeIndex) {
                            const width = e.clientX - col.ref.current.offsetLeft;
                            if (width >= minCellWidth) {
                                if (i + 1 < columns.length) {
                                    const nextCol = columns[i + 1];
                                    const nextColWidth = nextCol.ref.current.offsetWidth - (width - col.ref.current.offsetWidth);
                                    if (nextColWidth >= minCellWidth) {
                                        changed = true;
                                        nextColumnNewWidth = `${nextColWidth}px`;
                                        return `${width}px`;
                                    }
                                } else {
                                    return `${width}px`;
                                }
                            }
                        } else if (i === activeIndex + 1) {
                            return nextColumnNewWidth || `${col.ref.current.offsetWidth}px`;
                        }
                        return columnsWidth[i] || `${col.ref.current.offsetWidth}px`;
                    });
                    if (changed) setColumnsWidth(gridColumns);

                })
            );
        },
        [activeIndex, columns, minCellWidth, frame]
    );


    const removeListeners = useCallback(() => {
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', removeListeners);
    }, [mouseMove]);

    const mouseUp = useCallback(() => {
        setActiveIndex(null);
        removeListeners();
    }, [setActiveIndex, removeListeners]);

    useEffect(() => {
        if (activeIndex !== null) {
            window.addEventListener('mousemove', mouseMove);
            window.addEventListener('mouseup', mouseUp);
        }

        return () => {
            if (frame) {
                if (typeof frame === "number") {
                    cancelAnimationFrame(frame);
                }
            }
            removeListeners();
        }
    }, [frame, activeIndex, mouseUp, removeListeners]);


    const closeEditModal = () => {
        setIsModalOpen(false);
    }


    return (
        <div className={'w-full'}>
            <table className="resizeable-table min-w-full">
                <thead>
                <tr className={'h-10'}>
                    {columns.map(({ ref, text }, i) => (
                        <th ref={ref} key={text} className={`relative border border-gray-200`} style={{ width: columnsWidth[i] }}>
                            <span>{text}</span>
                            {text !== 'en' ? (
                                <div
                                    onMouseDown={() => mouseDown(i)}
                                    className={`resizer min-h-full ${activeIndex === i ? 'active' : 'idle'}`}
                                />
                            ) : (
                                ''
                            )}

                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Object.entries(data).map(([key, value]) => (
                        <tr key={key} id={key} className="divide-gray-200">
                            <td className={`py-4 pl-4 pr-4 text-sm font-mono text-gray-900 break-all border border-gray-200
                             relative ${columnsWidth.length ? '' : 'w-1/5'}`}>
                                {key}
                                <div
                                    onMouseDown={() => mouseDown(0)}
                                    className={`resizer min-h-full`}
                                />
                            </td>
                            {// reverse hardcode
                                Object.entries(value).reverse().map(([translateKey, translateValue]) => (
                                    <td className={`p-4 text-sm text-gray-500 border border-gray-300 relative ${columnsWidth.length ? '' : 'w-2/5'}`}
                                        key={`${key}/${translateKey}`}
                                    >

                                        <button
                                            type="button"
                                            className="rounded-full  p-1 text-white shadow-sm
                                                                         focus-visible:outline focus-visible:outline-2
                                                                         focus-visible:outline-offset-2 absolute top-0 right-0"
                                            onClick={(event) => {
                                                setIsModalOpen(true);
                                                if (typeof translateValue === 'string') {
                                                    setEditData({'key': key, 'language': translateKey, 'dataFields': {'default': translateValue}});
                                                    return;
                                                }
                                                setEditData({'key': key, 'language': translateKey, 'dataFields': translateValue});
                                            }}                                                        >
                                            <EllipsisVerticalIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
                                        </button>
                                        <div className={'pr-2 pt-3'}>
                                            {typeof translateValue === 'object' ? (
                                                Object.entries(translateValue).map(([genderKey, genderValue]) => (
                                                    <React.Fragment key={`${key}/${translateKey}/${genderKey}`}>
                                                        <span className="text-red-600">{genderKey}</span>
                                                        <div>
                                                            <Cell
                                                                id={`${key}/${translateKey}/${genderKey}`}
                                                                value={genderValue}
                                                                data={data}
                                                                setError={setError}
                                                                syncData={syncData}
                                                            />
                                                        </div>

                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <Cell
                                                    id={`${key}/${translateKey}`}
                                                    value={translateValue}
                                                    data={data}
                                                    setError={setError}
                                                    syncData={syncData}
                                                />
                                            )}
                                            {translateKey === 'ru' ? (
                                                <div
                                                    onMouseDown={() => mouseDown(1)}
                                                    className={`resizer min-h-full`}
                                                    />
                                            ) : (
                                                ''
                                                )
                                            }
                                        </div>
                                    </td>

                                ))
                            }
                            <td className='whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium border border-gray-200 sm:pr-8 lg:pr-8 z-1'>
                                <a href="#" className="text-red-600 hover:text-red-900" onClick={() => {
                                    setIsRemoveModalOpen(true);
                                    setRemovedKey(key);
                                }}>
                                    Remove
                                </a>
                            </td>
                        </tr>
                    )
                )}
                </tbody>
            </table>
            {editData['dataFields'] && (
                <EditModal isOpen={isModalOpen}
                           closeModal={closeEditModal}
                           dataFields={editData['dataFields']}
                           language={editData['language']}
                           pairKey={editData['key']}
                           setError={setError}
                           syncData={syncData}
                />
            )}
            <RemoveModal isOpen={isRemoveModalOpen} closeModal={closeRemoveModal} removedKey={removedKey} syncData={syncData}/>
            <ScrollButton />
        </div>
    )
}

export default Table;
