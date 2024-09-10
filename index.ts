// const TrezorConnect = require('@trezor/connect').default;
// const { TRANSPORT_EVENT, DEVICE_EVENT } = require('@trezor/connect');
import TrezorConnect, { TRANSPORT_EVENT, DEVICE_EVENT } from '@trezor/connect';

/**
 * Please note, that this example needs:
 * - Trezor bridge running
 * - Device connected to USB
 */
const runExample = async () => {
    await TrezorConnect.init({
        manifest: {
            appUrl: 'my app',
            email: 'app@myapp.meow',
        },
        debug: true,
    });

    // this event will be fired when bridge starts or stops or there is no bridge running
    TrezorConnect.on(TRANSPORT_EVENT, event => {
        console.log("On transport event", event);
    });

    // this event will be fired when device connects, disconnects or changes
    TrezorConnect.on(DEVICE_EVENT, event => {
        console.log("On device event", event);
    });

    const result = await TrezorConnect.getFeatures();

    console.log(result);

    if (!result.success) {
        process.exit(1);
    } else {
        process.exit(0);
    }
};

runExample();
