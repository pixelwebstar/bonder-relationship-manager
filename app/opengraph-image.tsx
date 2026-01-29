import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Bonder | Relationship Manager';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

// Image generation
export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0B0A1A',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Glows */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-20%',
                        width: '60%',
                        height: '60%',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                        borderRadius: '100%',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-20%',
                        width: '60%',
                        height: '60%',
                        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)',
                        borderRadius: '100%',
                    }}
                />

                {/* Logo Section */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 240,
                        height: 240,
                        background: '#0B0C1E',
                        borderRadius: '60px',
                        border: '2px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        marginBottom: 40,
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at center, rgba(157, 80, 255, 0.3) 0%, transparent 80%)',
                        }}
                    />
                    <svg
                        viewBox="0 0 24 24"
                        width="160"
                        height="160"
                        style={{
                            position: 'relative',
                            zIndex: 10
                        }}
                    >
                        <path
                            d="M6 4H13.5C16.5 4 18 5.5 18 8C18 10 17 11.5 15.5 12C17.5 12.5 19 14 19 16.5C19 19 17.5 20.5 14.5 20.5H6V4Z"
                            fill="url(#final_og_b_gradient)"
                        />
                        <defs>
                            <linearGradient id="final_og_b_gradient" x1="6" y1="4" x2="19" y2="20.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#9D50FF" />
                                <stop offset="1" stopColor="#6E2CFF" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Text Section */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 900,
                            color: 'white',
                            marginBottom: 16,
                            letterSpacing: '-2px',
                        }}
                    >
                        Bonder
                    </div>
                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 600,
                            color: '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: '8px',
                        }}
                    >
                        Relationship Manager
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
