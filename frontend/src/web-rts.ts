import { io, Socket } from "socket.io-client";

export class CallClient {
  peerConnection: RTCPeerConnection;
  socket: Socket;

  constructor(iceServers: RTCIceServer[], jwt: string) {
    this.peerConnection = new RTCPeerConnection({ iceServers });
    this.socket = io("/", { auth: { token: jwt } });
  }

  attachLocal(stream: MediaStream) {
    stream.getTracks().forEach((t) => this.peerConnection.addTrack(t, stream));
  }

  onRemoteTrack(cb: (ms: MediaStream) => void) {
    const remote = new MediaStream();
    this.peerConnection.addEventListener("track", (e: RTCTrackEvent) => {
      remote.addTrack(e.track);
      cb(remote);
    });
  }

  wireSignaling(roomId: string) {
    this.socket.emit("join", { roomId });

    this.peerConnection.onicecandidate = ({ candidate }) => {
      if (candidate) this.socket.emit("ice", { roomId, candidate });
    };

    this.socket.on("ice", ({ candidate }) =>
      this.peerConnection.addIceCandidate(candidate)
    );
    this.socket.on("offer", async ({ sdp }) => {
      await this.peerConnection.setRemoteDescription({ type: "offer", sdp });
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.socket.emit("answer", { roomId, sdp: answer.sdp });
    });

    this.socket.on("answer", async ({ sdp }) => {
      await this.peerConnection.setRemoteDescription({ type: "answer", sdp });
    });
  }

  async startCall(roomId: string) {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.socket.emit("offer", { roomId, sdp: offer.sdp });
  }
}
