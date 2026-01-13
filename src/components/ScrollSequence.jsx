import React, { useRef, useEffect, useState } from 'react';

const frameCount = 96;
const currentFrame = (index) =>
    `/slide/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

const ScrollSequence = () => {
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [loaded, setLoaded] = useState(false);

    // Preload images
    useEffect(() => {
        let imagesLoaded = 0;
        const imgs = [];

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === frameCount) {
                    setLoaded(true);
                }
            };
            imgs.push(img);
        }
        setImages(imgs);
    }, []);

    // Draw frame logic
    const renderFrame = (index) => {
        const canvas = canvasRef.current;
        if (!canvas || !images[index]) return;

        const context = canvas.getContext('2d');
        const img = images[index];

        // Calculate aspect ratio to cover (contain or cover logic)
        // Here we'll use a "contain" or "cover" approach ensuring it fills screen
        // Let's assume we want to fill the canvas which is 100vw 100vh

        // Clean canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image - scaling to contain (fixes "too big" on mobile)
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        // If mobile, scale down a bit more to ensure "explode" doesn't clip
        const isMobile = window.innerWidth < 768;
        const scaleFactor = isMobile ? 0.8 : 1;
        const ratio = Math.min(hRatio, vRatio) * scaleFactor;

        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        context.drawImage(
            img,
            0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
        );
    };

    // Scroll listener
    useEffect(() => {
        if (!loaded || images.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Initial render
        renderFrame(0);

        const handleScroll = () => {
            const html = document.documentElement;
            const scrollTop = html.scrollTop;
            const maxScrollTop = html.scrollHeight - window.innerHeight;
            const scrollFraction = scrollTop / maxScrollTop;

            const frameIndex = Math.min(
                frameCount - 1,
                Math.ceil(scrollFraction * frameCount)
            );

            // Safety check
            const safeIndex = Math.max(0, frameIndex);

            requestAnimationFrame(() => renderFrame(safeIndex));
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Maybe re-render current frame needed? 
            // For simplicity let scroll handle it or re-calc based on current scroll
            handleScroll();
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', () => { });
        };
    }, [loaded, images]);

    if (!loaded) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1
            }}
        />
    );
};

export default ScrollSequence;
