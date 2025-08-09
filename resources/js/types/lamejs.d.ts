declare module 'lamejs' {
    export class Mp3Encoder {
        constructor(channels: number, sampleRate: number, bitRate: number);
        encodeBuffer(samples: Int16Array): Int8Array;
        flush(): Int8Array;
    }

    // Add other exports as needed
    export const lamejs: {
        Mp3Encoder: typeof Mp3Encoder;
    };

    export default lamejs;
}
