import { ImageResponse } from 'next/og';


// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0B0C1E',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 4,
                        background: 'radial-gradient(circle at center, rgba(157, 80, 255, 0.2) 0%, transparent 70%)',
                    }}
                />
                <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    style={{
                        position: 'relative',
                        zIndex: 10
                    }}
                >
                    <path
                        d="M6 4H13.5C16.5 4 18 5.5 18 8C18 10 17 11.5 15.5 12C17.5 12.5 19 14 19 16.5C19 19 17.5 20.5 14.5 20.5H6V4Z"
                        fill="url(#final_icon_b_gradient)"
                    />
                    <defs>
                        <linearGradient id="final_icon_b_gradient" x1="6" y1="4" x2="19" y2="20.5" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#9D50FF" />
                            <stop offset="1" stopColor="#6E2CFF" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
