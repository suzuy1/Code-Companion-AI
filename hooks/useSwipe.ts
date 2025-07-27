import { useEffect, useRef, useCallback } from 'react';

interface SwipeOptions {
    onSwipeRight: () => void;
    threshold?: number; // swipe distance threshold in pixels
    edgeThreshold?: number; // distance from the left edge to start swipe
}

/**
 * A hook to detect a rightward swipe from the left edge of the screen.
 * Perfect for triggering a sidebar to open on mobile devices.
 */
export const useSwipe = ({ onSwipeRight, threshold = 50, edgeThreshold = 60 }: SwipeOptions) => {
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const firstTouch = e.touches[0];
        // Only consider swipes starting from the left edge of the screen
        if (firstTouch.clientX < edgeThreshold) {
            touchStartRef.current = { x: firstTouch.clientX, y: firstTouch.clientY };
        } else {
            touchStartRef.current = null;
        }
    }, [edgeThreshold]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!touchStartRef.current) return;

        const firstTouch = e.touches[0];
        const deltaX = firstTouch.clientX - touchStartRef.current.x;
        const deltaY = Math.abs(firstTouch.clientY - touchStartRef.current.y);

        // A swipe is considered "right" if it's moved more horizontally than vertically
        if (deltaX > threshold && deltaY < deltaX) {
            onSwipeRight();
            // Reset after a successful swipe to prevent multiple triggers
            touchStartRef.current = null;
        }
    }, [onSwipeRight, threshold]);

    const handleTouchEnd = useCallback(() => {
        // Reset on touch end regardless
        touchStartRef.current = null;
    }, []);

    useEffect(() => {
        // Use passive listeners for performance, as we are not preventing default behavior.
        const options = { passive: true };
        window.addEventListener('touchstart', handleTouchStart, options);
        window.addEventListener('touchmove', handleTouchMove, options);
        window.addEventListener('touchend', handleTouchEnd, options);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
};
