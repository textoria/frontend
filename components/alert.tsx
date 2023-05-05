import { useState, useEffect } from 'react';

interface AlertProps {
    message: string;
    duration?: number;
}

const Alert: React.FC<AlertProps> = ({ message, duration = 3000 }) => {
    const [showAlert, setShowAlert] = useState<boolean>(true);

    useEffect(() => {
        setShowAlert(true);
        const timer = setTimeout(() => {
            setShowAlert(false);
        }, duration);

        return () => {
            clearTimeout(timer);
        };
    }, [duration, message]);

    return (
        <div
            className={`fixed top-0 left-0 right-0 mt-4 mx-auto w-11/12 md:w-1/2 lg:w-1/3 ${
                showAlert ? 'transform translateY-0 opacity-100' : 'transform -translate-y-full opacity-0'
            } transition-all duration-500 ease-in-out z-50`}
        >
            <div
                className='rounded-md p-4 text-white bg-red-500'
            >
                {message}
            </div>
        </div>
    );
};

export default Alert;
