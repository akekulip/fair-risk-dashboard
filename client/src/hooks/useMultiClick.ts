import { useState, useEffect, useCallback } from 'react';

interface MultiClickHandlers {
    onSingleClick?: () => void;
    onDoubleClick?: () => void;
    onTripleClick?: () => void;
}

export const useMultiClick = ({
    onSingleClick,
    onDoubleClick,
    onTripleClick,
}: MultiClickHandlers, delay = 250) => {
    const [clickCount, setClickCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (clickCount === 1) {
                onSingleClick && onSingleClick();
            } else if (clickCount === 2) {
                onDoubleClick && onDoubleClick();
            } else if (clickCount === 3) {
                onTripleClick && onTripleClick();
            }
            setClickCount(0);
        }, delay);

        return () => clearTimeout(timer);
    }, [clickCount, delay, onSingleClick, onDoubleClick, onTripleClick]);

    const handleClick = useCallback(() => {
        setClickCount((prev) => prev + 1);
    }, []);

    return handleClick;
};
