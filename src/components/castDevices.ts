const castContext = cast.framework.CastReceiverContext.getInstance();

// Device Ids
export enum deviceIds {
    AUDIO, // Assume we can only do audio
    GEN1, // 1st generation Chromecast
    GEN2, // 2nd generation Chromecast
    GEN3, // 3rd generation Chromecast
    ULTRA, // Chromecast Ultra
    NESTHUBANDMAX, //Nest hub and Nest hub max
    ANDROID, // Android Devices with Chromecast built-in
    CCGTV //Chromecast Google TV
}

// cached device id, avoid looking it up again and again
let deviceId: number | null = null;

/**
 * Get device id of the active Cast device.
 * Tries to identify the active Cast device by testing support for different codecs.
 * @returns Active Cast device Id.
 */
export function getActiveDeviceId(): number {
    const deduceId = (): number => {
        const { hardwareConcurrency, userAgent } = window.navigator;

        // Chromecast with Google TV supports 'H.264 High Profile, level 5.1'
        if (castContext.canDisplayType('video/mp4; codecs="avc1.640033')) {
            return deviceIds.CCGTV;
        }

        // Android Devices with Chromecast built-in
        if (userAgent.includes('Android')) {
            return deviceIds.ANDROID;
        }

        // Chromecast Ultra supports 'HEVC main profile, level 3.1'
        if (castContext.canDisplayType('video/mp4; codecs=hev1.1.6.L93.B0')) {
            return deviceIds.ULTRA;
        }

        // 3rd generation Chromecast supports 'H.264 high profile, level 4.2'
        if (castContext.canDisplayType('video/mp4; codecs=avc1.64002A')) {
            return deviceIds.GEN3;
        }

        // Nest Hub can do VP9, but the GEN1 and GEN 2 can only do VP8
        if (castContext.canDisplayType('video/webm', 'vp9')) {
            return deviceIds.NESTHUBANDMAX;
        }

        // 1st and 2nd generation Chromecast supports 'H.264 high profile, level 4.1'
        if (castContext.canDisplayType('video/mp4', 'avc1.640029')) {
            // 2nd and 1st generation Chromecast can be differentiated by hardwareConcurrency
            if (hardwareConcurrency === 2) {
                return deviceIds.GEN2;
            }

            if (hardwareConcurrency === 1) {
                return deviceIds.GEN1;
            }
        }

        return deviceIds.AUDIO;
    };

    if (deviceId == null) {
        deviceId = deduceId();
    }

    return deviceId;
}
