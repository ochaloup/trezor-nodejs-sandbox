#!/usr/bin/env node

import TrezorConnect, { TRANSPORT_EVENT, DEVICE_EVENT, DEVICE, UI_EVENT, UI, UI_RESPONSE } from '@trezor/connect';
import { UI_REQUEST, Device } from '@trezor/connect';

/**
 * Please note, that this example needs:
 * - Trezor bridge running
 * - Device connected to USB
 */
async function main() {

    // https://connect.trezor.io/9/methods/other/init/
    await TrezorConnect.init({
        manifest: {
            appUrl: 'my app',
            email: 'app@myapp.meow',
        },
        debug: false,
    });
    console.log(">>> TrezorConnect.init() finished");

    // // this event will be fired when bridge starts or stops or there is no bridge running
    // TrezorConnect.on(TRANSPORT_EVENT, event => {
    //     console.log("on [TRANSPORT_EVENT]", event);
    // });
    // // this event will be fired when device connects, disconnects or changes
    // TrezorConnect.on(DEVICE_EVENT, event => {
    //     console.log("on [DEVICE_EVENT]", event);
    // }); 
    // this event will be fired when device connects, disconnects or changes


    /// --- PASSPHRASE ---
    // See: https://trezor.io/learn/a/passphrases-and-hidden-wallets
    // To disable asking about passphrase use `use_passphrase: false`
    // To inspiration how to manage the 'on events' to cover the passphrase see:
    // https://github.com/decred/decrediton/blob/master/app/actions/TrezorActions.js#L269

    // --- HW WALLET configuration ---
    // Some configuration is saved on the device and as such has to be confirmed on device
    // const settings = {
    //     // Setup to not ask for any passphrase at all
    //     // use_passphrase: false,
    //     // Asking Trezor to ask for passphrase on device always
    //     // HW wallet will remember we want this setup
    //     // otherwise it will permit to ask for passphrase on the computer
    //     // passphrase_always_on_device: false,
    // };
    // console.log(">>> Applying settings", JSON.stringify(settings, undefined, 1))
    // await TrezorConnect.applySettings(settings);

    console.log(">>> Waiting for a device to get connected...")
    const features = await TrezorConnect.getFeatures();

    if (features.success === false) {
        console.error("Cannot get info about Trezor features set", features.payload.error);
        process.exit(1);
    }
    console.log(">>> Device features", features);

    // Funny thing about the passphrase we need to use the eventing system to enter it
    // when we set value: '' then it's the same as when `use_passphrase: false` is set
    const somePassPhrase = '';
    TrezorConnect.on(UI_EVENT, async (event) => {
        console.log(">>> UI_EVENT", event);
        if(event.type == 'ui-request_passphrase') {
            console.log(">>> Entering passphrase")
            TrezorConnect.uiResponse({                
                type: UI_RESPONSE.RECEIVE_PASSPHRASE,
                payload: {
                    value: somePassPhrase ? somePassPhrase : '',
                    save: true,
                }
            });
        }
    });

    if (features.success === true) {
        if (features.payload.unlocked === false) {
            console.error("Device is locked, please unlock it...");
        }
        if (features.payload.passphrase_always_on_device === true && somePassPhrase !== '') {
            console.error("Device has got configured passphrase to be asked on device, parameter --passphrase will be skipped");
        }
    }

    const deviceState = await TrezorConnect.getDeviceState();
    if (deviceState.success === false) {
        console.error("Device state error", deviceState.payload.error);
        process.exit(1);
    } else {
        console.log(">>> Device state", deviceState.payload.state);
    }

    // https://github.com/trezor/trezor-suite/blob/develop/docs/packages/connect/methods.md

    // // Trezor pubkey format
    // const pubkey = await TrezorConnect.solanaGetPublicKey({
    //     path: "m/44'/501'/0'/0'",
    //     useEmptyPassphrase: true,
    //     showOnTrezor: false,
    // });
    // if (pubkey.success === false) {
    //     console.error("Pubkey error", pubkey.payload.error);
    //     process.exit(1);
    // } else {
    //     console.log(">>> Solana pubkey", pubkey.payload.publicKey);
    // }

    // Solana pubkey address format
    const address = await TrezorConnect.solanaGetAddress({
        path: "m/44'/501'/0'/0'",
        // useEmptyPassphrase: true,
        showOnTrezor: false,
    })
    if (address.success === false) {
        console.error("Pubkey error", address.payload.error);
        process.exit(1);
    } else {
        console.log(">>> Solana address", address.payload.address);
    }

    // const info = await TrezorConnect.getAccountInfo({
    //     path: "m/44'/501'/0'/0'",
    //     coin: 'sol',
    // });
    // if (info.success === false) {
    //     console.error("Account info error", info.payload.error);
    //     process.exit(1);
    // } else {
    //     console.log(">>> Account info", info.payload);
    // }
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
