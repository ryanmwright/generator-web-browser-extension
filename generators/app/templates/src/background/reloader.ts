import * as io from 'socket.io-client';

function reloadExtension() {
    setTimeout(() => {
        chrome.runtime.reload();
    }, 100);
}

const socket = io(`http://localhost:8090`);
socket.on('onFileChange', reloadExtension);
