import { useEffect, useState } from "react"
import Game from "./components/Game"
import { socket } from "./socket";

function App() {
  // State to keep track of connection status of the WebSocket
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Set up and clean up the WebSocket connection
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col items-center w-screen h-screen p-2">
        <h1 className="text-3xl font-bold">ECS 511U Yesh Chandiramani Individual Project</h1>
        <h3 className="text-2xl font-bold">Server connection state: {'' + isConnected }</h3>
        <Game />
      </div>
    </>
  )
}

export default App
