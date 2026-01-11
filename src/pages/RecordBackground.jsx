import React from 'react';
import Plasma from '../components/Plasma';

const RecordBackground = () => {
    return (
        <div style={{ width: '100%', height: '100vh', background: '#000', position: 'relative' }}>
            <Plasma
                color="#b19eef"
                speed={0.5}
                direction="forward"
                scale={1.3}
                opacity={1.0}
                mouseInteractive={true}
                paused={false}
            />
        </div>
    );
};

export default RecordBackground;
