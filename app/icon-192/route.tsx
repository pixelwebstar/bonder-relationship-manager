import { ImageResponse } from 'next/og';



export const dynamic = 'force-static';

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '192px',
                    height: '192px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                    borderRadius: '32px',
                }}
            >
                <div
                    style={{
                        fontSize: 110,
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
            width: 192,
            height: 192,
        }
    );
}
