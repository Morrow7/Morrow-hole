import PixelSnow from '../component/PixeSnow';
export default function Home() {
    return(
        <>
            <div style={{ width: '100%', height: '600px', position: 'relative' }}>
                <PixelSnow
                    color="#ffffff"
                    flakeSize={0.01}
                    minFlakeSize={1.25}
                    pixelResolution={200}
                    speed={1.25}
                    density={0.3}
                    direction={125}
                    brightness={1}
                    depthFade={8}
                    farPlane={20}
                    gamma={0.4545}
                    variant="square"
                />
            </div>
        </>
    )
}