import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                    borderRadius: '36px',
                }}
            >
                <div
                    style={{
                        fontSize: 100,
                        fontWeight: 900,
                        color: 'white',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    B
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
