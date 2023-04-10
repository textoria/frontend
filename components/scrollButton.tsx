import { useState, useEffect } from "react";
import {ArrowLongUpIcon} from "@heroicons/react/20/solid";

const ScrollToTopButton = () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 300) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {showButton && (
                <button
                    onClick={handleClick}
                    className="scroll-button fixed bottom-6 right-6 p-4 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-800 opacity-80"
                >
                    <ArrowLongUpIcon className='w-6 h-6' />
                </button>
            )}
        </>
    );
};

export default ScrollToTopButton;