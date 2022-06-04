<script>
    import { createUUID, getServerUrl } from "./utils.js";

    let localVideo = null;
    let localStream = null;
    let remoteVideo = null;
    let peerConnection;
    let uuid;
    let serverConnection;

    let peerConnectionConfig = {
        iceServers: [
            { urls: "stun:stun.stunprotocol.org:3478" },
            { urls: "stun:stun.l.google.com:19302" },
        ],
    };

    function start(isCaller) {
        peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.onicecandidate = gotIceCandidate;
        peerConnection.ontrack = (event) =>
            (remoteVideo.srcObject = event.streams[0]);
        peerConnection.addStream(localStream);

        if (isCaller) {
            peerConnection
                .createOffer()
                .then(createdDescription)
                .catch(console.log);
        }
    }

    function gotIceCandidate(event) {
        if (event.candidate != null) {
            serverConnection.send(
                JSON.stringify({ ice: event.candidate, uuid: uuid })
            );
        }
    }

    function createdDescription(description) {
        console.log("got description");

        peerConnection
            .setLocalDescription(description)
            .then(function () {
                serverConnection.send(
                    JSON.stringify({
                        sdp: peerConnection.localDescription,
                        uuid: uuid,
                    })
                );
            }).catch(console.log);
    }

    async function pageReady() {
        uuid = createUUID();

        serverConnection = new WebSocket(getServerUrl()+'/ws/2');
        serverConnection.onmessage = async (message) => {
            if (!peerConnection) start(false);
            let signal = JSON.parse(message.data);
            if (signal.uuid == uuid) return;

            if (signal.sdp) {
                peerConnection
                    .setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(function () {
                        if (signal.sdp.type == "offer") {
                            peerConnection
                                .createAnswer()
                                .then(createdDescription)
                                .catch(console.log);
                        }
                    }).catch(console.log);
            } else if (signal.ice) {
                peerConnection
                    .addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch(console.log);
            }
        };

        if (navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            localVideo.srcObject = stream;
            localStream = stream;
        } else alert("Your browser does not support getUserMedia API");
    }
    pageReady();
</script>
<video bind:this={localVideo} autoplay muted style="width:40%;" /><!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={remoteVideo} autoplay style="width:40%;" />


<br />
<p id="status"></p>

<button on:click|once={() => start(true)}>Start Video</button>