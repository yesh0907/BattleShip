import { useState, useEffect } from 'react';

// Hook for detecting key presses (only used for debugging purposes)
export const useKeyPress = (targetKey: string) => {
    const [keyPressed, setKeyPressed] = useState(false);

    useEffect(() => {
        const downHandler = ({ key }: { key: string }) => {
            if (key === targetKey) {
                setKeyPressed(true);
            }
        };

        const upHandler = ({ key }: { key: string }) => {
            if (key === targetKey) {
                setKeyPressed(false);
            }
        };

        // Listen for keydown and keyup events
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, [targetKey]);

    return keyPressed;
}