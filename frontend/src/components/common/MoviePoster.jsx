import React from 'react';
import { getPosterUrl } from '../../utils/movie';

export default function MoviePoster({ src, alt, className = '' }) {
    const url = getPosterUrl(src);
    return (
        <img
            src={url}
            alt={alt}
            className={className}
            onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getPosterUrl(null);
            }}
        />
    );
}
