import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, className, placeholder = '/images/placeholder.jpg', ...props }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let observer;
    
    if (imageRef && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Load the actual image
              const img = new Image();
              img.src = src;
              img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
              };
              img.onerror = () => {
                console.error(`Failed to load image: ${src}`);
                setImageSrc(placeholder);
              };
              observer.unobserve(imageRef);
            }
          });
        },
        {
          rootMargin: '50px' // Start loading 50px before the image enters viewport
        }
      );
      observer.observe(imageRef);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageSrc, imageRef, placeholder]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded && imageSrc === placeholder ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage;
