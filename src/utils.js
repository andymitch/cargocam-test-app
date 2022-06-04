export const createUUID = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4()
}

export const getServerUrl = () => {
    return 'ws://cargocam.herokuapp.com'//'ws://127.0.0.1:3434'
}
