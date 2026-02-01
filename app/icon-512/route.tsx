import { ImageResponse } from 'next/og';



export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '512px',
                    height: '512px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                    borderRadius: '96px',
                }}
            >
                <div
                    style={{
                        fontSize: 280,
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
            width: 512,
            height: 512,
        }
    );
}
